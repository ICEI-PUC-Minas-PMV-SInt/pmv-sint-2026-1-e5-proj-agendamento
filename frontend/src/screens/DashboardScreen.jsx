import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import BottomMenu from '../components/BottomMenu';

const days = [
  { day: 'DOM', date: '14', active: false },
  { day: 'SEG', date: '15', active: true },
  { day: 'TER', date: '16', active: false },
  { day: 'QUA', date: '17', active: false },
  { day: 'QUI', date: '18', active: false },
  { day: 'SEX', date: '19', active: false },
];

const appointments = [
  {
    id: 1,
    time: '09:00',
    title: 'Volume Brasileiro',
    client: 'Carolina Mendes',
    status: 'CONCLUÍDO',
    statusColor: '#999',
    statusBg: '#F0F0F0',
    borderColor: 'transparent',
  },
  {
    id: 2,
    time: '14:30',
    title: 'Manutenção Clássico',
    client: 'Mariana Silva',
    status: 'CONFIRMADO',
    statusColor: '#2E7D32',
    statusBg: '#E8F5E9',
    borderColor: colors.roseGold,
    showButton: true,
  },
  {
    id: 3,
    time: '16:00',
    title: 'Volume Russo',
    client: 'Juliana Costa',
    status: 'PENDENTE',
    statusColor: '#F57F17',
    statusBg: '#FFFDE7',
    borderColor: '#FFC107',
  },
];

export default function DashboardScreen({ route, navigation }) {
  const userName = route?.params?.userName;

  function handleLogout() {
    navigation.replace('Login');
  }

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
          {days.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCard,
                item.active && styles.dateCardActive
              ]}
            >
              <Text style={[styles.dayText, item.active && styles.textWhite]}>{item.day}</Text>
              <Text style={[styles.dateText, item.active && styles.textWhite]}>{item.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>PRÓXIMO</Text>
            <Text style={styles.summaryValue}>14:30</Text>
            <View style={styles.summaryRow}>
              <View style={styles.blackCircle} />
              <Text style={styles.summarySubtitle}>Manutenção</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>NA SEMANA</Text>
            <View style={styles.summaryRowValue}>
              <Text style={styles.summaryValue}>24</Text>
              <Text style={styles.summarySubtitleWeek}> agend.</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={styles.progressBarFill} />
            </View>
            <Text style={styles.revenueText}>R$ 3.2k prev.</Text>
          </View>
        </View>

        <View style={styles.pendingCard}>
          <View style={styles.pendingLeft}>
            <View style={styles.pendingCircleLeft} />
            <View>
              <Text style={styles.pendingTitle}>Pendentes</Text>
              <Text style={styles.pendingSubtitle}>3 aguardando confirmação</Text>
            </View>
          </View>
          <View style={styles.pendingCircleRight} />
        </View>

        <View style={styles.agendaHeader}>
          <Text style={styles.agendaTitle}>AGENDA DO DIA</Text>
          <TouchableOpacity>
            <Text style={styles.filtersText}>Filtros</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.agendaList}>
          {appointments.map((apt) => (
            <View key={apt.id} style={styles.appointmentRow}>
              <Text style={styles.appointmentTime}>{apt.time}</Text>
              <View style={[styles.appointmentCard, { borderLeftColor: apt.borderColor, borderLeftWidth: apt.borderColor !== 'transparent' ? 4 : 0 }]}>
                <View style={styles.appointmentCardHeader}>
                  <Text style={styles.appointmentTitle}>{apt.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: apt.statusBg }]}>
                    <Text style={[styles.statusText, { color: apt.statusColor }]}>{apt.status}</Text>
                  </View>
                </View>
                <Text style={styles.appointmentClient}>{apt.client}</Text>
                {apt.showButton && (
                  <View style={styles.appointmentActions}>
                    <TouchableOpacity style={styles.startButton}>
                      <Text style={styles.startButtonText}>Iniciar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionSquare} />
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
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
    fontWeight: 'bold',
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
  },
});
