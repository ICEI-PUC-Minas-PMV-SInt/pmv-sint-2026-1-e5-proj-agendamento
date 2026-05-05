import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, SectionList, Image, TouchableOpacity, ScrollView } from 'react-native';

import { colors } from '../theme/colors';
import BottomMenu from '../components/BottomMenu';

const mockClients = [
  {
    title: 'A',
    data: [
      {
        id: '1',
        name: 'Amanda Silva',
        phone: '(11) 98765-4321',
        status: 'Últ. visita: 12/04',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        isVip: true,
      },
      {
        id: '2',
        name: 'Ana Paula Costa',
        phone: '(11) 99876-5432',
        status: 'Últ. visita: 05/03',
        initials: 'A',
      },
      {
        id: '3',
        name: 'Aline Mendes',
        phone: '(11) 91234-5678',
        status: 'Aniversário em 2 dias',
        statusType: 'birthday',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      },
    ],
  },
  {
    title: 'B',
    data: [
      {
        id: '4',
        name: 'Bruna Oliveira',
        phone: '(11) 95555-4444',
        status: 'Nova cliente',
        statusType: 'new',
        avatarUrl: 'https://i.pravatar.cc/150?img=9',
      },
    ],
  },
];

const FILTERS = ['Todos', 'Recentes', 'Frequentes', 'Aniversariantes'];

export default function ClientsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Clientes</Text>
      <TouchableOpacity style={styles.profileButton}>
        <View style={styles.profileDot} />
      </TouchableOpacity>
    </View>
  );

  const renderClientCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.initialsAvatar]}>
            <Text style={styles.initialsText}>{item.initials}</Text>
          </View>
        )}
        {item.isVip && (
          <View style={styles.vipBadge}>
            <Text style={styles.vipText}>VIP</Text>
          </View>
        )}
      </View>

      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientPhone}>{item.phone}</Text>
        {item.status && (
          <View style={styles.statusBadge}>
            <Text
              style={[
                styles.statusText,
                item.statusType === 'birthday' && styles.statusTextBirthday,
              ]}
            >
              {item.status}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length} clientes</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        {renderHeader()}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar nome ou telefone..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                activeFilter === filter && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <SectionList
        sections={mockClients}
        keyExtractor={(item) => item.id}
        renderItem={renderClientCard}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />

      <View style={styles.paginatorContainer}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <BottomMenu active="Clientes" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    color: colors.black,
    fontFamily: 'BodoniModa_700Bold',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  profileDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.roseGold,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
    gap: 12,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  filterPillActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.mutedText,
  },
  sectionCount: {
    fontSize: 14,
    color: colors.mutedText,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  initialsAvatar: {
    backgroundColor: '#F3E5D8', // Light beige for initials
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 20,
    color: colors.roseGold,
    fontWeight: '500',
    fontFamily: 'serif',
  },
  vipBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: '#E6C200', // Gold/Yellow
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.white,
  },
  vipText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
  },
  clientInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    fontSize: 12,
    color: colors.mutedText,
  },
  statusTextBirthday: {
    color: colors.roseGold,
  },
  paginatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: '#D1D5DB',
  },
});
