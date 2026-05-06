import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import BottomMenu from '../components/BottomMenu';
import Input from '../components/Input';
import Button from '../components/Button';
import { api } from '../services/api';

export default function ClientProfileScreen({ route, navigation }) {
  const [client, setClient] = useState(route?.params?.client || {});
  const [showForm, setShowForm] = useState(false);

  const [nome, setNome] = useState(client.name || '');
  const [telefone, setTelefone] = useState(client.phone === 'Sem telefone' ? '' : (client.phone || ''));
  const [email, setEmail] = useState(client.email || '');
  const [dataNascimento, setDataNascimento] = useState(client.dataNascimento ? client.dataNascimento.split('T')[0] : '');
  const [observacoes, setObservacoes] = useState(client.observacoes || '');

  const formatPhone = (value) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length === 0) return '';
    if (v.length <= 2) return `(${v}`;
    if (v.length <= 3) return `(${v.substring(0, 2)}) ${v.substring(2)}`;
    if (v.length <= 7) return `(${v.substring(0, 2)}) ${v.substring(2, 3)} ${v.substring(3)}`;
    return `(${v.substring(0, 2)}) ${v.substring(2, 3)} ${v.substring(3, 7)} ${v.substring(7)}`;
  };

  const formatDate = (value) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length === 0) return '';
    if (v.length <= 4) return v;
    if (v.length <= 6) return `${v.substring(0, 4)}-${v.substring(4)}`;
    return `${v.substring(0, 4)}-${v.substring(4, 6)}-${v.substring(6)}`;
  };

  async function handleSaveClient() {
    const newErrors = [];

    if (!nome || nome.trim().length < 3) {
      newErrors.push('O nome deve ter pelo menos 3 caracteres.');
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length < 8) {
        newErrors.push('E-mail inválido ou muito curto (mínimo 8 caracteres).');
      }
    }

    if (telefone) {
      const phoneClean = telefone.replace(/\D/g, '');
      if (phoneClean.length > 0 && phoneClean.length < 10) {
        newErrors.push('O telefone deve ter pelo menos 10 dígitos.');
      }
    }

    if (dataNascimento) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dataNascimento)) {
        newErrors.push('Data de nascimento em formato inválido (AAAA-MM-DD).');
      }
    }

    if (newErrors.length > 0) {
      if (Platform.OS === 'web') {
        window.alert('Atenção: Verifique os erros no formulário.\n' + newErrors.join('\n'));
      } else {
        Alert.alert('Atenção', 'Verifique os erros no formulário.\n' + newErrors.join('\n'));
      }
      return;
    }

    const clientData = {
      nome: nome.trim(),
      telefone,
      email,
      dataNascimento: dataNascimento || null,
      observacoes,
    };

    try {
      await api.put(`/Cliente/${client.id}`, {
        id: Number(client.id),
        ...clientData,
      });

      const updatedClient = {
        ...client,
        name: clientData.nome,
        phone: clientData.telefone || 'Sem telefone',
        email: clientData.email,
        dataNascimento: clientData.dataNascimento,
        observacoes: clientData.observacoes
      };

      setClient(updatedClient);
      setShowForm(false);

      if (Platform.OS === 'web') {
        window.alert('Cliente atualizado com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');
      }

      navigation.replace('ClientProfile', { client: updatedClient });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      if (Platform.OS === 'web') {
        window.alert('Erro: ' + (typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage));
      } else {
        Alert.alert('Erro', typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
      }
    }
  }

  function handleDelete() {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm('Tem certeza que deseja excluir esta cliente? Esta ação não poderá ser desfeita e os dados serão perdidos.');
      if (confirmDelete) {
        deleteClient();
      }
    } else {
      Alert.alert(
        'Excluir Cliente',
        'Tem certeza que deseja excluir esta cliente? Esta ação não poderá ser desfeita e os dados serão perdidos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: deleteClient }
        ]
      );
    }
  }

  async function deleteClient() {
    try {
      await api.delete(`/Cliente/${client.id}`);
      if (Platform.OS === 'web') {
        window.alert('Cliente excluída com sucesso!');
        navigation.navigate('Clientes');
      } else {
        Alert.alert('Sucesso', 'Cliente excluída com sucesso!', [
          { text: 'OK', onPress: () => navigation.navigate('Clientes') }
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  }

  const clientName = client.name || 'Amanda Silva';
  const clientInitials = client.initials || clientName.charAt(0).toUpperCase();
  const isVip = client.isVip !== undefined ? client.isVip : true;
  const clientSince = 'Cliente desde Mar 2023';

  const avatarSource = client.avatarUrl
    ? { uri: client.avatarUrl }
    : { uri: 'https://i.pravatar.cc/150?img=47' };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Feather name="chevron-left" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil da Cliente</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowForm(!showForm)}>
            <Feather name={showForm ? "x" : "edit"} size={18} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
            <Feather name="trash-2" size={18} color="#E0315D" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {showForm ? (
          <View style={styles.form}>
            <Input
              label="Nome *"
              placeholder="Ex: Amanda Silva"
              value={nome}
              onChangeText={setNome}
            />
            <Input
              label="Telefone"
              placeholder="Ex: (11) 9 9999 9999"
              value={telefone}
              onChangeText={text => setTelefone(formatPhone(text))}
              keyboardType="numeric"
              maxLength={16}
            />
            <Input
              label="E-mail"
              placeholder="Ex: amanda@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Data de Nascimento"
              placeholder="Ex: 2000-01-23"
              value={dataNascimento}
              onChangeText={text => setDataNascimento(formatDate(text))}
              maxLength={10}
            />
            {/* <Input
              label="Observações"
              placeholder="Alergias, preferências, etc."
              value={observacoes}
              onChangeText={setObservacoes}
              multiline={true}
            /> */}
            <View style={{ marginTop: 16 }}>
              <Button title="Salvar alterações" onPress={handleSaveClient} />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Image source={avatarSource} style={styles.avatar} />
                {isVip && (
                  <View style={styles.vipBadge}>
                    <Text style={styles.vipText}>👑 VIP</Text>
                  </View>
                )}
              </View>
              <Text style={styles.clientName}>{clientName}</Text>
              <Text style={styles.clientSince}>{clientSince}</Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Feather name="message-circle" size={20} color="#25D366" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Feather name="phone" size={20} color={colors.roseGold} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Feather name="mail" size={20} color={colors.mutedText} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Feather name="calendar" size={14} color={colors.roseGold} style={styles.statIcon} />
                <Text style={styles.statLabel}>Total de Visitas</Text>
                <Text style={styles.statValue}>12</Text>
              </View>
              <View style={styles.statCard}>
                <Feather name="file-text" size={14} color={colors.roseGold} style={styles.statIcon} />
                <Text style={styles.statLabel}>Ticket Médio</Text>
                <Text style={styles.statValue}>R$ 185</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Observações</Text>
                <TouchableOpacity>
                  <Feather name="edit-2" size={16} color={colors.roseGold} />
                </TouchableOpacity>
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.subTitle}>ALERGIAS</Text>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Fita Micropore</Text>
                </View>
                <Text style={[styles.subTitle, { marginTop: 16 }]}>PREFERÊNCIAS</Text>
                <Text style={styles.bodyText}>
                  {client.observacoes || "Gosta de volume russo, mas com aspecto natural. Mapping gatinho (fox eye). Olho direito lacrimeja um pouco."}
                </Text>
              </View>
            </View>

            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Histórico de Agendamentos</Text>
              <TouchableOpacity>
                <Text style={styles.linkText}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeline}>
              <View style={styles.timelineLine} />

              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.historyCard}>
                  <View style={styles.historyCardHeader}>
                    <Text style={styles.historyDate}>15 Outubro 2023</Text>
                    <View style={[styles.statusTag, styles.statusSuccess]}>
                      <Text style={[styles.statusText, styles.statusTextSuccess]}>Concluído</Text>
                    </View>
                  </View>
                  <Text style={styles.historyTitle}>Manutenção Volume Russo</Text>

                  <View style={styles.historyDetailRow}>
                    <Feather name="clock" size={12} color={colors.mutedText} />
                    <Text style={styles.historyDetailText}>14:00 - 15:30 (1h 30min)</Text>
                  </View>
                  <View style={styles.historyDetailRow}>
                    <Feather name="tag" size={12} color={colors.mutedText} />
                    <Text style={styles.historyDetailText}>R$ 120,00</Text>
                  </View>
                  <View style={styles.historyDetailRow}>
                    <Feather name="user" size={12} color={colors.mutedText} />
                    <Text style={styles.historyDetailText}>Profissional: Sandra Chiu</Text>
                  </View>

                  <View style={styles.historyNote}>
                    <Text style={styles.historyNoteText}>"Retenção excelente, perdeu apenas 30%. Usamos curvatura D, espessura 0.05."</Text>
                  </View>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.historyCard}>
                  <View style={styles.historyCardHeader}>
                    <Text style={styles.historyDate}>20 Setembro 2023</Text>
                    <View style={[styles.statusTag, styles.statusDefault]}>
                      <Text style={[styles.statusText, styles.statusTextDefault]}>Concluído</Text>
                    </View>
                  </View>
                  <Text style={styles.historyTitle}>Manutenção Volume Russo</Text>
                  <View style={styles.historyDetailRow}>
                    <Feather name="clock" size={12} color={colors.mutedText} />
                    <Text style={styles.historyDetailText}>10:00 - 11:30 (1h 30min)</Text>
                  </View>
                  <View style={styles.historyDetailRow}>
                    <Feather name="tag" size={12} color={colors.mutedText} />
                    <Text style={styles.historyDetailText}>R$ 120,00</Text>
                  </View>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.historyCard}>
                  <View style={styles.historyCardHeader}>
                    <Text style={styles.historyDate}>25 Agosto 2023</Text>
                    <View style={[styles.statusTag, styles.statusDefault]}>
                      <Text style={[styles.statusText, styles.statusTextDefault]}>Concluído</Text>
                    </View>
                  </View>
                  <Text style={styles.historyTitle}>Primeira Aplicação - Vol. Russo</Text>
                  <View style={styles.historyDetailRow}>
                    <Feather name="clock" size={12} color={colors.mutedText} />
                    <Text style={styles.historyDetailText}>14:00 - 16:30 (2h 30min)</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ height: 140 }} />
          </>
        )}
      </ScrollView>

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.floatingButton}>
          <Text style={styles.floatingButtonText}>+ Novo Agendamento</Text>
        </TouchableOpacity>
      </View>

      <BottomMenu active="Clientes" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0EBE6',
  },
  container: {
    flex: 1,
    backgroundColor: '#FCFAF8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE6',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFEAE4',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'BodoniModa_700Bold',
    color: colors.black,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.white,
  },
  vipBadge: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.white,
  },
  vipText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  clientName: {
    fontSize: 24,
    fontFamily: 'BodoniModa_700Bold',
    color: colors.black,
    marginBottom: 4,
  },
  clientSince: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0EBE6',
  },
  statIcon: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.mutedText,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'BodoniModa_700Bold',
    color: colors.black,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0EBE6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE6',
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'BodoniModa_700Bold',
    color: colors.black,
  },
  sectionContent: {
    marginTop: 8,
  },
  subTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.mutedText,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#E0315D',
    fontWeight: '500',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  linkText: {
    fontSize: 14,
    color: colors.roseGold,
    fontWeight: '500',
  },
  timeline: {
    position: 'relative',
    paddingLeft: 12,
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 10,
    bottom: 0,
    width: 2,
    backgroundColor: '#EBE5DF',
  },
  timelineItem: {
    position: 'relative',
    marginBottom: 16,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 24,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.roseGold,
    borderWidth: 2,
    borderColor: '#FCFAF8',
    zIndex: 1,
  },
  historyCard: {
    marginLeft: 24,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0EBE6',
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.roseGold,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusSuccess: {
    backgroundColor: '#E6F8ED',
  },
  statusTextSuccess: {
    color: '#00A84D',
  },
  statusDefault: {
    backgroundColor: '#F3F4F6',
  },
  statusTextDefault: {
    color: colors.mutedText,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  historyTitle: {
    fontSize: 16,
    fontFamily: 'BodoniModa_700Bold',
    color: colors.black,
    marginBottom: 12,
  },
  historyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyDetailText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 8,
  },
  historyNote: {
    marginTop: 12,
    backgroundColor: '#F9F7F5',
    padding: 12,
    borderRadius: 8,
  },
  historyNoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.mutedText,
    lineHeight: 18,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 85,
    left: 24,
    right: 24,
  },
  floatingButton: {
    backgroundColor: '#9A5B66',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  floatingButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
