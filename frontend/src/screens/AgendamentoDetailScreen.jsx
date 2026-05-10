import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity } from 'react-native';

import { colors } from '../theme/colors';
import Button from '../components/Button';
import Input from '../components/Input';
import { api } from '../services/api';

const STATUS_LABEL = ['Agendado', 'Realizado', 'Cancelado'];
const STATUS_COLOR = ['#2E7D32', '#666', '#D32F2F'];

function notify(msg) {
  if (Platform.OS === 'web') window.alert(msg);
  else Alert.alert('Aviso', msg);
}

function confirm(msg) {
  if (Platform.OS === 'web') return window.confirm(msg);
  return new Promise((resolve) => {
    Alert.alert('Confirmar', msg, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Confirmar', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function AgendamentoDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [agendamento, setAgendamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [dataHora, setDataHora] = useState('');
  const [observacoes, setObservacoes] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await api.get(`/Agendamento/${id}`);
      setAgendamento(data);
      const dt = new Date(data.dataHora);
      const fmt = `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      setDataHora(fmt);
      setObservacoes(data.observacoes || '');
    } catch (e) {
      notify(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleCancelar() {
    if (!(await confirm('Cancelar este agendamento?'))) return;
    try {
      await api.patch(`/Agendamento/${id}/cancelar`);
      notify('Agendamento cancelado.');
      navigation.goBack();
    } catch (e) { notify(e.message); }
  }

  async function handleConcluir() {
    if (!(await confirm('Marcar como realizado?'))) return;
    try {
      await api.patch(`/Agendamento/${id}/concluir`);
      notify('Agendamento concluído.');
      navigation.goBack();
    } catch (e) { notify(e.message); }
  }

  async function handleSalvarEdicao() {
    const regex = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;
    if (!regex.test(dataHora)) {
      notify('Use o formato DD/MM/AAAA HH:MM');
      return;
    }
    const [datePart, timePart] = dataHora.split(' ');
    const [day, month, year] = datePart.split('/');
    const iso = `${year}-${month}-${day}T${timePart}:00`;
    try {
      await api.put(`/Agendamento/${id}`, {
        ...agendamento,
        dataHora: iso,
        observacoes,
      });
      notify('Agendamento atualizado.');
      setEditing(false);
      load();
    } catch (e) { notify(e.message); }
  }

  if (loading || !agendamento) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.roseGold} /></View>;
  }

  const status = agendamento.status ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹  Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Agendamento</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 80 }}>
        <View style={styles.card}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.statusText, { color: STATUS_COLOR[status] }]}>{STATUS_LABEL[status]}</Text>

          <Text style={styles.label}>Cliente</Text>
          <Text style={styles.value}>{agendamento.cliente?.nome || '—'}</Text>

          <Text style={styles.label}>Serviço</Text>
          <Text style={styles.value}>{agendamento.servico?.nome || '—'}</Text>

          <Text style={styles.label}>Duração</Text>
          <Text style={styles.value}>{agendamento.servico?.duracaoMinutos ?? '—'} min</Text>

          <Text style={styles.label}>Preço</Text>
          <Text style={styles.value}>R$ {Number(agendamento.servico?.preco ?? 0).toFixed(2)}</Text>

          {!editing ? (
            <>
              <Text style={styles.label}>Data e Hora</Text>
              <Text style={styles.value}>{dataHora}</Text>

              <Text style={styles.label}>Observações</Text>
              <Text style={styles.value}>{observacoes || '—'}</Text>
            </>
          ) : (
            <>
              <Input label="Data e Hora" value={dataHora} onChangeText={setDataHora} placeholder="DD/MM/AAAA HH:MM" />
              <Input label="Observações" value={observacoes} onChangeText={setObservacoes} multiline />
            </>
          )}
        </View>

        {status === 0 && !editing && (
          <>
            <Button title="Marcar como realizado" onPress={handleConcluir} />
            <View style={{ height: 8 }} />
            <Button title="Editar" onPress={() => setEditing(true)} />
            <View style={{ height: 8 }} />
            <Button title="Cancelar agendamento" onPress={handleCancelar} />
          </>
        )}

        {editing && (
          <>
            <Button title="Salvar alterações" onPress={handleSalvarEdicao} />
            <View style={{ height: 8 }} />
            <Button title="Descartar" onPress={() => { setEditing(false); load(); }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  backBtnText: { color: colors.black, fontSize: 16 },
  title: { fontSize: 22, fontFamily: 'BodoniModa_700Bold', color: colors.black },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 20, marginBottom: 20 },
  label: { fontSize: 12, color: colors.mutedText, fontWeight: 'bold', marginTop: 12, textTransform: 'uppercase' },
  value: { fontSize: 15, color: colors.black, marginTop: 4 },
  statusText: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
});
