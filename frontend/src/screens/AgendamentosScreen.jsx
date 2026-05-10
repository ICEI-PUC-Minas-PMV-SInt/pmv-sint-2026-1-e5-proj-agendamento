import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { colors } from '../theme/colors';
import BottomMenu from '../components/BottomMenu';
import { api } from '../services/api';

const STATUS_FILTERS = [
  { label: 'Todos', value: null },
  { label: 'Agendados', value: 0 },
  { label: 'Realizados', value: 1 },
  { label: 'Cancelados', value: 2 },
];

const STATUS_LABEL = ['AGENDADO', 'REALIZADO', 'CANCELADO'];
const STATUS_COLOR = ['#2E7D32', '#999', '#D32F2F'];
const STATUS_BG = ['#E8F5E9', '#F0F0F0', '#FFEBEE'];

export default function AgendamentosScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const query = statusFilter !== null ? `?status=${statusFilter}` : '';
      const data = await api.get(`/Agendamento${query}`);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  function renderItem({ item }) {
    const dt = new Date(item.dataHora);
    const dataStr = dt.toLocaleDateString('pt-BR');
    const horaStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    const status = item.status ?? 0;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AgendamentoDetail', { id: item.id })}
      >
        <View style={styles.row}>
          <Text style={styles.dateText}>{dataStr} · {horaStr}</Text>
          <View style={[styles.badge, { backgroundColor: STATUS_BG[status] }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLOR[status] }]}>{STATUS_LABEL[status]}</Text>
          </View>
        </View>
        <Text style={styles.servico}>{item.servico?.nome || 'Serviço'}</Text>
        <Text style={styles.cliente}>{item.cliente?.nome || 'Cliente'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Agendamentos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.label}
              style={[styles.pill, statusFilter === f.value && styles.pillActive]}
              onPress={() => setStatusFilter(f.value)}
            >
              <Text style={[styles.pillText, statusFilter === f.value && styles.pillTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.roseGold} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhum agendamento encontrado.</Text>
          }
        />
      )}

      <BottomMenu active="Agendamentos" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topContainer: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 32, color: colors.black, fontFamily: 'BodoniModa_700Bold' },
  pill: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.black, borderColor: colors.black },
  pillText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  pillTextActive: { color: colors.white },
  card: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateText: { fontSize: 13, color: colors.mutedText, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  servico: { fontSize: 16, fontWeight: 'bold', color: colors.black },
  cliente: { fontSize: 14, color: colors.mutedText, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.mutedText, marginTop: 30 },
});
