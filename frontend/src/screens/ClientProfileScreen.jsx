import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { colors } from '../theme/colors';
import BottomMenu from '../components/BottomMenu';
import Input from '../components/Input';
import Button from '../components/Button';
import { api } from '../services/api';

const STATUS_LABEL = ['Agendado', 'Realizado', 'Cancelado'];

function notify(msg) {
  if (Platform.OS === 'web') window.alert(msg);
  else Alert.alert('Aviso', msg);
}

function confirmDialog(msg) {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(msg));
  return new Promise((resolve) => {
    Alert.alert('Confirmar', msg, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Confirmar', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

function formatPhone(value) {
  let v = (value || '').replace(/\D/g, '');
  if (v.length > 11) v = v.substring(0, 11);
  if (v.length === 0) return '';
  if (v.length <= 2) return `(${v}`;
  if (v.length <= 3) return `(${v.substring(0, 2)}) ${v.substring(2)}`;
  if (v.length <= 7) return `(${v.substring(0, 2)}) ${v.substring(2, 3)} ${v.substring(3)}`;
  return `(${v.substring(0, 2)}) ${v.substring(2, 3)} ${v.substring(3, 7)} ${v.substring(7)}`;
}

function formatDateInput(value) {
  let v = (value || '').replace(/\D/g, '');
  if (v.length > 8) v = v.substring(0, 8);
  if (v.length === 0) return '';
  if (v.length <= 4) return v;
  if (v.length <= 6) return `${v.substring(0, 4)}-${v.substring(4)}`;
  return `${v.substring(0, 4)}-${v.substring(4, 6)}-${v.substring(6)}`;
}

export default function ClientProfileScreen({ route, navigation }) {
  const initial = route?.params?.client || {};
  const clientId = initial.id;

  const [client, setClient] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const load = useCallback(async () => {
    if (!clientId) {
      notify('Cliente sem identificador. Volte e tente novamente.');
      navigation.goBack();
      return;
    }
    setLoading(true);
    try {
      const [c, h] = await Promise.all([
        api.get(`/Cliente/${clientId}`),
        api.get(`/Agendamento/cliente/${clientId}`),
      ]);
      setClient(c);
      setHistorico(h);
      setNome(c.nome || '');
      setTelefone(c.telefone ? formatPhone(c.telefone) : '');
      setEmail(c.email || '');
      setDataNascimento(c.dataNascimento ? c.dataNascimento.split('T')[0] : '');
      setObservacoes(c.observacoes || '');
    } catch (e) {
      notify(e.message);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleSave() {
    if (!nome || nome.trim().length < 3) {
      notify('Nome deve ter pelo menos 3 caracteres.');
      return;
    }
    try {
      await api.put(`/Cliente/${clientId}`, {
        id: Number(clientId),
        nome: nome.trim(),
        telefone,
        email,
        dataNascimento: dataNascimento || null,
        observacoes,
      });
      notify('Cliente atualizado.');
      setShowForm(false);
      load();
    } catch (e) {
      notify(e.message);
    }
  }

  async function handleDelete() {
    if (!(await confirmDialog('Excluir esta cliente? Os agendamentos relacionados não poderão referenciá-la.'))) return;
    try {
      await api.delete(`/Cliente/${clientId}`);
      notify('Cliente excluída.');
      navigation.navigate('Clientes');
    } catch (e) {
      notify(e.message);
    }
  }

  if (loading || !client) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.roseGold} /></View>;
  }

  const realizados = historico.filter((a) => a.status === 1);
  const totalVisitas = realizados.length;
  const ticketMedio = totalVisitas > 0
    ? realizados.reduce((s, a) => s + (Number(a.servico?.preco) || 0), 0) / totalVisitas
    : 0;
  const isVip = totalVisitas >= 10;

  const criadoEm = client.criadoEm ? new Date(client.criadoEm) : null;
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const clienteSince = criadoEm
    ? `Cliente desde ${meses[criadoEm.getMonth()]} ${criadoEm.getFullYear()}`
    : 'Cadastro recente';

  const initials = (client.nome || '?').trim().charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Feather name="chevron-left" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil da Cliente</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowForm(!showForm)}>
            <Feather name={showForm ? 'x' : 'edit'} size={18} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
            <Feather name="trash-2" size={18} color="#E0315D" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {showForm ? (
          <View style={styles.form}>
            <Input label="Nome *" value={nome} onChangeText={setNome} placeholder="Ex: Amanda Silva" />
            <Input
              label="Telefone"
              value={telefone}
              onChangeText={(t) => setTelefone(formatPhone(t))}
              keyboardType="numeric"
              maxLength={16}
              placeholder="(11) 9 9999 9999"
            />
            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="amanda@email.com"
            />
            <Input
              label="Data de Nascimento"
              value={dataNascimento}
              onChangeText={(t) => setDataNascimento(formatDateInput(t))}
              maxLength={10}
              placeholder="AAAA-MM-DD"
            />
            <Input label="Observações" value={observacoes} onChangeText={setObservacoes} placeholder="Alergias, preferências, etc." multiline />
            <View style={{ marginTop: 16 }}>
              <Button title="Salvar alterações" onPress={handleSave} />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, styles.initialsAvatar]}>
                  <Text style={styles.initialsText}>{initials}</Text>
                </View>
                {isVip && (
                  <View style={styles.vipBadge}>
                    <Text style={styles.vipText}>VIP</Text>
                  </View>
                )}
              </View>
              <Text style={styles.clientName}>{client.nome}</Text>
              <Text style={styles.clientSince}>{clienteSince}</Text>
              <Text style={styles.clientContact}>{client.telefone || ''}</Text>
              {client.email ? <Text style={styles.clientContact}>{client.email}</Text> : null}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Feather name="calendar" size={14} color={colors.roseGold} style={styles.statIcon} />
                <Text style={styles.statLabel}>Total de Visitas</Text>
                <Text style={styles.statValue}>{totalVisitas}</Text>
              </View>
              <View style={styles.statCard}>
                <Feather name="file-text" size={14} color={colors.roseGold} style={styles.statIcon} />
                <Text style={styles.statLabel}>Ticket Médio</Text>
                <Text style={styles.statValue}>R$ {ticketMedio.toFixed(0)}</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Observações</Text>
                <TouchableOpacity onPress={() => setShowForm(true)}>
                  <Feather name="edit-2" size={16} color={colors.roseGold} />
                </TouchableOpacity>
              </View>
              <Text style={styles.bodyText}>
                {client.observacoes || 'Sem observações cadastradas.'}
              </Text>
            </View>

            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Histórico de Agendamentos</Text>
              <Text style={styles.linkText}>{historico.length} no total</Text>
            </View>

            {historico.length === 0 ? (
              <Text style={{ color: colors.mutedText, textAlign: 'center', marginVertical: 20 }}>
                Esta cliente ainda não tem agendamentos.
              </Text>
            ) : (
              <View style={styles.timeline}>
                <View style={styles.timelineLine} />
                {historico.map((a) => {
                  const dt = new Date(a.dataHora);
                  const dataStr = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                  const horaStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
                  const status = a.status ?? 0;
                  return (
                    <View key={a.id} style={styles.timelineItem}>
                      <View style={styles.timelineDot} />
                      <TouchableOpacity
                        style={styles.historyCard}
                        onPress={() => navigation.navigate('AgendamentoDetail', { id: a.id })}
                      >
                        <View style={styles.historyCardHeader}>
                          <Text style={styles.historyDate}>{dataStr}</Text>
                          <View style={[styles.statusTag, status === 1 ? styles.statusSuccess : status === 2 ? styles.statusCancel : styles.statusDefault]}>
                            <Text style={[styles.statusText, status === 1 ? styles.statusTextSuccess : status === 2 ? styles.statusTextCancel : styles.statusTextDefault]}>
                              {STATUS_LABEL[status]}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.historyTitle}>{a.servico?.nome || 'Serviço'}</Text>
                        <View style={styles.historyDetailRow}>
                          <Feather name="clock" size={12} color={colors.mutedText} />
                          <Text style={styles.historyDetailText}>{horaStr} ({a.servico?.duracaoMinutos ?? '?'} min)</Text>
                        </View>
                        <View style={styles.historyDetailRow}>
                          <Feather name="tag" size={12} color={colors.mutedText} />
                          <Text style={styles.historyDetailText}>R$ {Number(a.servico?.preco || 0).toFixed(2)}</Text>
                        </View>
                        {a.observacoes ? (
                          <View style={styles.historyNote}>
                            <Text style={styles.historyNoteText}>"{a.observacoes}"</Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={{ height: 140 }} />
          </>
        )}
      </ScrollView>

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('Dashboard', { preselectClienteId: clientId })}
        >
          <Text style={styles.floatingButtonText}>+ Novo Agendamento</Text>
        </TouchableOpacity>
      </View>

      <BottomMenu active="Clientes" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCFAF8' },
  form: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: '#F0EBE6',
  },
  container: { flex: 1, backgroundColor: '#FCFAF8' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0EBE6',
  },
  headerButton: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#EFEAE4',
    justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white,
  },
  headerTitle: { fontSize: 20, fontFamily: 'BodoniModa_700Bold', color: colors.black },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24 },
  profileSection: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: colors.white },
  initialsAvatar: { backgroundColor: '#F3E5D8', justifyContent: 'center', alignItems: 'center' },
  initialsText: { fontSize: 36, color: colors.roseGold, fontFamily: 'BodoniModa_700Bold' },
  vipBadge: {
    position: 'absolute', bottom: 0, alignSelf: 'center',
    backgroundColor: '#1C1C1E', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 2, borderColor: colors.white,
  },
  vipText: { fontSize: 10, color: '#FFD700', fontWeight: 'bold' },
  clientName: { fontSize: 24, fontFamily: 'BodoniModa_700Bold', color: colors.black, marginBottom: 4 },
  clientSince: { fontSize: 14, color: colors.mutedText, marginBottom: 6 },
  clientContact: { fontSize: 13, color: colors.mutedText },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0EBE6' },
  statIcon: { marginBottom: 12 },
  statLabel: { fontSize: 12, color: colors.mutedText, marginBottom: 4 },
  statValue: { fontSize: 20, fontFamily: 'BodoniModa_700Bold', color: colors.black },
  sectionCard: { backgroundColor: colors.white, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#F0EBE6' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0EBE6', paddingBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'BodoniModa_700Bold', color: colors.black },
  bodyText: { fontSize: 14, lineHeight: 22, color: colors.text },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  linkText: { fontSize: 14, color: colors.roseGold, fontWeight: '500' },
  timeline: { position: 'relative', paddingLeft: 12 },
  timelineLine: { position: 'absolute', left: 15, top: 10, bottom: 0, width: 2, backgroundColor: '#EBE5DF' },
  timelineItem: { position: 'relative', marginBottom: 16 },
  timelineDot: {
    position: 'absolute', left: 0, top: 24, width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.roseGold, borderWidth: 2, borderColor: '#FCFAF8', zIndex: 1,
  },
  historyCard: { marginLeft: 24, backgroundColor: colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0EBE6' },
  historyCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyDate: { fontSize: 12, fontWeight: 'bold', color: colors.roseGold },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusSuccess: { backgroundColor: '#E6F8ED' },
  statusTextSuccess: { color: '#00A84D' },
  statusDefault: { backgroundColor: '#F3F4F6' },
  statusTextDefault: { color: colors.mutedText },
  statusCancel: { backgroundColor: '#FFEBEE' },
  statusTextCancel: { color: '#D32F2F' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  historyTitle: { fontSize: 16, fontFamily: 'BodoniModa_700Bold', color: colors.black, marginBottom: 12 },
  historyDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  historyDetailText: { fontSize: 12, color: colors.text, marginLeft: 8 },
  historyNote: { marginTop: 12, backgroundColor: '#F9F7F5', padding: 12, borderRadius: 8 },
  historyNoteText: { fontSize: 12, fontStyle: 'italic', color: colors.mutedText, lineHeight: 18 },
  floatingButtonContainer: { position: 'absolute', bottom: 85, left: 24, right: 24 },
  floatingButton: { backgroundColor: '#9A5B66', borderRadius: 24, paddingVertical: 16, alignItems: 'center' },
  floatingButtonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});
