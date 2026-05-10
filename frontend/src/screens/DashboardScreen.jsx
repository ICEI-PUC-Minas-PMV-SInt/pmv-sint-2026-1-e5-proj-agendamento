import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import BottomMenu from '../components/BottomMenu';
import Input from '../components/Input';
import Button from '../components/Button';
import AutocompleteInput from '../components/AutocompleteInput';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { validateAgendamento } from '../utils/validators';

export default function DashboardScreen({ route, navigation }) {
  const { usuario, signOut } = useAuth();
  const userName = usuario?.nome || '';
  const [days, setDays] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedServico, setSelectedServico] = useState(null);
  const [dataHora, setDataHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [agendamentosGeral, setAgendamentosGeral] = useState([]);

  useEffect(() => {
    if (showForm) {
      loadData();
    }
  }, [showForm]);

  // Quando outra tela navegar com preselectClienteId, abre o form ja pre-selecionado
  useEffect(() => {
    const preId = route?.params?.preselectClienteId;
    if (!preId) return;
    (async () => {
      try {
        const clientesData = await api.get('/Cliente');
        setClientes(clientesData);
        const servicosData = await api.get('/Servico');
        setServicos(servicosData);
        const found = clientesData.find((c) => c.id === preId);
        if (found) setSelectedCliente(found);
        setShowForm(true);
        navigation.setParams({ preselectClienteId: undefined });
      } catch (e) {
        console.error('Erro ao carregar dados pre-selecao:', e);
      }
    })();
  }, [route?.params?.preselectClienteId]);

  async function loadData() {
    try {
      const clientesData = await api.get('/Cliente');
      setClientes(clientesData);
      const servicosData = await api.get('/Servico');
      setServicos(servicosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  async function fetchAgendamentos() {
    try {
      const data = await api.get('/Agendamento');
      setAgendamentosGeral(data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchAgendamentos();
    }, [])
  );

  useEffect(() => {
    const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    const generatedDays = [];
    const today = new Date();

    for (let i = -1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      generatedDays.push({
        id: i,
        day: weekDays[d.getDay()],
        date: String(d.getDate()).padStart(2, '0'),
        active: i === 0,
        fullDate: d
      });
    }
    setDays(generatedDays);
  }, []);

  function handleDayPress(selectedId) {
    setDays((prevDays) =>
      prevDays.map((item) => ({
        ...item,
        active: item.id === selectedId
      }))
    );
  }

  async function handleLogout() {
    await signOut();
  }

  function resetForm() {
    setSelectedCliente(null);
    setSelectedServico(null);
    setDataHora('');
    setObservacoes('');
    setFormErrors({});
    setShowForm(false);
  }

  const formatDateTime = (value) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 12) v = v.substring(0, 12);

    if (v.length === 0) return '';
    if (v.length <= 2) return v;
    if (v.length <= 4) return `${v.substring(0, 2)}/${v.substring(2)}`;
    if (v.length <= 8) return `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
    if (v.length <= 10) return `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4, 8)} ${v.substring(8)}`;
    return `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4, 8)} ${v.substring(8, 10)}:${v.substring(10)}`;
  };

  async function handleSaveAgendamento() {
    const horariosOcupados = agendamentosGeral
      .filter((a) => a.status === 0)
      .map((a) => a.dataHora);

    const result = validateAgendamento({
      cliente: selectedCliente,
      servico: selectedServico,
      dataHora,
      horariosOcupados,
    });

    if (!result.ok) {
      setFormErrors(result.errors);
      return;
    }
    setFormErrors({});

    const dt = result.parsedDate;
    const formattedDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}:00`;

    try {
      const payload = {
        clienteId: selectedCliente.id,
        servicoId: selectedServico.id,
        dataHora: formattedDate,
        observacoes,
        status: 0
      };
      await api.post('/Agendamento', payload);
      resetForm();
      fetchAgendamentos();
    } catch (error) {
      if (error.status === 409) {
        setFormErrors({ dataHora: 'Já existe um agendamento neste horário.' });
        return;
      }
      Alert.alert('Erro', error.message);
      if (typeof window !== 'undefined') window.alert(error.message);
    }
  }

  const activeDay = days.find(d => d.active);

  const filteredAppointments = agendamentosGeral.filter(a => {
    if (!activeDay) return false;
    const apptDate = new Date(a.dataHora);
    return apptDate.getFullYear() === activeDay.fullDate.getFullYear() &&
      apptDate.getMonth() === activeDay.fullDate.getMonth() &&
      apptDate.getDate() === activeDay.fullDate.getDate();
  }).map(a => {
    const apptDate = new Date(a.dataHora);
    const timeString = `${String(apptDate.getHours()).padStart(2, '0')}:${String(apptDate.getMinutes()).padStart(2, '0')}`;

    let statusString = 'AGENDADO';
    let statusColor = '#2E7D32';
    let statusBg = '#E8F5E9';
    let borderColor = colors.roseGold;

    if (a.status === 1) { // Realizado
      statusString = 'REALIZADO';
      statusColor = '#999';
      statusBg = '#F0F0F0';
      borderColor = 'transparent';
    } else if (a.status === 2) { // Cancelado
      statusString = 'CANCELADO';
      statusColor = '#D32F2F';
      statusBg = '#FFEBEE';
      borderColor = '#D32F2F';
    } else if (a.status === 0) { // Agendado
      statusString = 'CONFIRMADO';
    }

    return {
      id: a.id,
      time: timeString,
      title: a.servico ? a.servico.nome : 'Sem Serviço',
      client: a.cliente ? a.cliente.nome : 'Sem Cliente',
      status: statusString,
      statusColor,
      statusBg,
      borderColor,
      showButton: a.status === 0,
    };
  });

  const now = new Date();

  const futureAppointments = agendamentosGeral
    .filter(a => a.status === 0 && new Date(a.dataHora) > now)
    .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

  const proximo = futureAppointments[0] || null;
  const proximoTime = proximo
    ? `${String(new Date(proximo.dataHora).getHours()).padStart(2, '0')}:${String(new Date(proximo.dataHora).getMinutes()).padStart(2, '0')}`
    : '--:--';
  const proximoServico = proximo && proximo.servico ? proximo.servico.nome : 'Nenhum agendamento';

  const dayOfWeek = now.getDay() || 7; // Domingo vira 7
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekIntervalText = `${String(startOfWeek.getDate()).padStart(2, '0')} a ${String(endOfWeek.getDate()).padStart(2, '0')} de ${meses[endOfWeek.getMonth()]}`;

  const weekAppointments = agendamentosGeral.filter(a => {
    if (a.status === 2) return false; // Ignora cancelados
    const d = new Date(a.dataHora);
    return d >= startOfWeek && d <= endOfWeek;
  });

  const weekCount = weekAppointments.length;
  const weekRevenue = weekAppointments.reduce((sum, a) => {
    return sum + (a.servico && a.servico.preco ? Number(a.servico.preco) : 0);
  }, 0);

  const formattedRevenue = weekRevenue >= 1000
    ? `R$ ${(weekRevenue / 1000).toFixed(1)}k prev.`
    : `R$ ${weekRevenue.toFixed(2).replace('.', ',')} prev.`;

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Olá, <Text style={styles.greetingName}>{userName}</Text>
            </Text>
            <Text style={styles.subtitle}>Sua agenda de hoje</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
            <View style={styles.avatarPlaceholder} />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelectorContainer}>
          {days.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.dateCard,
                item.active && styles.dateCardActive
              ]}
              onPress={() => handleDayPress(item.id)}
            >
              <Text style={[styles.dayText, item.active && styles.textWhite]}>{item.day}</Text>
              <Text style={[styles.dateText, item.active && styles.textWhite]}>{item.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>PRÓXIMO</Text>
            <Text style={styles.summaryValue}>{proximoTime}</Text>
            <View style={styles.summaryRow}>
              <View style={[styles.blackCircle, !proximo && { backgroundColor: '#CCC' }]} />
              <Text style={styles.summarySubtitle} numberOfLines={1} ellipsizeMode="tail">
                {proximoServico}
              </Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>NA SEMANA</Text>
            <Text style={styles.summaryWeekInterval}>{weekIntervalText}</Text>
            <View style={styles.summaryRowValue}>
              <Text style={styles.summaryValue}>{weekCount}</Text>
              <Text style={styles.summarySubtitleWeek}> agend.</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: weekCount > 0 ? '70%' : '0%' }]} />
            </View>
            <Text style={styles.revenueText}>{formattedRevenue}</Text>
          </View>
        </View>

        <View style={styles.agendaHeader}>
          <Text style={styles.agendaTitle}>AGENDA DO DIA</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Agendamentos')}>
            <Text style={styles.filtersText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {!showForm && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.newAppointmentButton} onPress={() => setShowForm(true)}>
              <Text style={styles.newAppointmentButtonText}>+ Novo agendamento</Text>
            </TouchableOpacity>
          </View>
        )}

        {showForm ? (
          <View style={styles.formContainer}>
            <AutocompleteInput
              label="Cliente *"
              placeholder="Digite o nome do cliente..."
              data={clientes}
              searchKey="nome"
              value={selectedCliente ? selectedCliente.nome : ''}
              onSelect={(c) => { setSelectedCliente(c); setFormErrors((p) => ({ ...p, cliente: null })); }}
            />
            {formErrors.cliente ? <Text style={styles.fieldError}>{formErrors.cliente}</Text> : null}
            <AutocompleteInput
              label="Serviço *"
              placeholder="Digite o nome do serviço..."
              data={servicos}
              searchKey="nome"
              value={selectedServico ? selectedServico.nome : ''}
              onSelect={(s) => { setSelectedServico(s); setFormErrors((p) => ({ ...p, servico: null })); }}
            />
            {formErrors.servico ? <Text style={styles.fieldError}>{formErrors.servico}</Text> : null}
            <Input
              label="Data e Hora *"
              value={dataHora}
              onChangeText={(text) => { setDataHora(formatDateTime(text)); setFormErrors((p) => ({ ...p, dataHora: null })); }}
              placeholder="DD/MM/AAAA HH:MM"
              keyboardType="numeric"
              maxLength={16}
              error={formErrors.dataHora}
            />
            <Input label="Observações" value={observacoes} onChangeText={setObservacoes} placeholder="Opcional" multiline />
            <Button title="Salvar Agendamento" onPress={handleSaveAgendamento} />
            <View style={{ height: 16 }} />
            <Button title="Cancelar" onPress={resetForm} />
          </View>
        ) : (
          <View style={styles.agendaList}>
            {filteredAppointments.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: colors.mutedText }}>Nenhum agendamento para este dia.</Text>
            ) : (
              filteredAppointments.map((apt) => (
                <View key={apt.id} style={styles.appointmentRow}>
                  <Text style={styles.appointmentTime}>{apt.time}</Text>
                  <TouchableOpacity
                    style={[styles.appointmentCard, { borderLeftColor: apt.borderColor, borderLeftWidth: apt.borderColor !== 'transparent' ? 4 : 0 }]}
                    onPress={() => navigation.navigate('AgendamentoDetail', { id: apt.id })}
                  >
                    <View style={styles.appointmentCardHeader}>
                      <Text style={styles.appointmentTitle}>{apt.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: apt.statusBg }]}>
                        <Text style={[styles.statusText, { color: apt.statusColor }]}>{apt.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.appointmentClient}>{apt.client}</Text>
                    {apt.showButton && (
                      <View style={styles.appointmentActions}>
                        <TouchableOpacity
                          style={styles.startButton}
                          onPress={async (e) => {
                            e.stopPropagation?.();
                            try {
                              await api.patch(`/Agendamento/${apt.id}/concluir`);
                              fetchAgendamentos();
                            } catch (err) {
                              Alert.alert('Erro', err.message);
                            }
                          }}
                        >
                          <Text style={styles.startButtonText}>Concluir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionSquare}
                          onPress={async (e) => {
                            e.stopPropagation?.();
                            try {
                              await api.patch(`/Agendamento/${apt.id}/cancelar`);
                              fetchAgendamentos();
                            } catch (err) {
                              Alert.alert('Erro', err.message);
                            }
                          }}
                        >
                          <Text style={{ color: '#D32F2F', fontWeight: 'bold', fontSize: 18 }}>×</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <BottomMenu active="Dashboard" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'BodoniModa_700Bold',
    color: colors.black,
  },
  greetingName: {
    color: colors.roseGold,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'column-reverse',
    alignItems: 'flex-end',
    gap: 8,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  logoutText: {
    fontSize: 14,
    color: colors.black,
    fontWeight: 'bold',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#CCC',
    borderWidth: 2,
    borderColor: colors.white,
  },
  dateSelectorContainer: {
    marginBottom: 30,
  },
  dateCard: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dateCardActive: {
    backgroundColor: colors.roseGold,
  },
  dayText: {
    fontSize: 12,
    color: colors.mutedText,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
  textWhite: {
    color: colors.white,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 12,
    color: colors.mutedText,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryWeekInterval: {
    fontSize: 10,
    color: colors.mutedText,
    marginTop: -8,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blackCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.black,
    marginRight: 8,
  },
  summarySubtitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  summaryRowValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  summarySubtitleWeek: {
    fontSize: 14,
    color: colors.mutedText,
    marginLeft: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.roseGold,
    borderRadius: 3,
    width: '70%',
  },
  revenueText: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'right',
  },
  pendingCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  pendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingCircleLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.beige,
    marginRight: 16,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  pendingSubtitle: {
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 2,
  },
  pendingCircleRight: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.black,
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  agendaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  filtersText: {
    fontSize: 14,
    color: colors.roseGold,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  newAppointmentButton: {
    backgroundColor: colors.black,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newAppointmentButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  agendaList: {
    gap: 20,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  appointmentTime: {
    width: 50,
    fontSize: 14,
    color: colors.mutedText,
    fontWeight: 'bold',
    marginTop: 16,
  },
  appointmentCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  appointmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  appointmentClient: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 16,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flex: 1,
    backgroundColor: colors.black,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  actionSquare: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldError: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
});
