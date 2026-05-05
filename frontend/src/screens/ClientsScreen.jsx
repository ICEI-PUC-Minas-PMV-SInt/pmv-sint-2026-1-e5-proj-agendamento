import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, SectionList, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';

import { colors } from '../theme/colors';
import BottomMenu from '../components/BottomMenu';
import { api } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import AppLitleButton from '../components/LitleButton';

const FILTERS = ['Todos', 'Recentes', 'Frequentes', 'Aniversariantes'];

export default function ClientsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/Cliente');

      const groupedData = data.reduce((acc, client) => {
        const initial = client.nome ? client.nome.charAt(0).toUpperCase() : '#';
        let section = acc.find(s => s.title === initial);

        const clientFormatted = {
          id: client.id.toString(),
          name: client.nome,
          phone: client.telefone || 'Sem telefone',
          email: client.email || '',
          dataNascimento: client.dataNascimento || '',
          observacoes: client.observacoes || '',
          initials: initial,
        };

        if (section) {
          section.data.push(clientFormatted);
        } else {
          acc.push({ title: initial, data: [clientFormatted] });
        }
        return acc;
      }, []);

      groupedData.sort((a, b) => a.title.localeCompare(b.title));

      setClients(groupedData);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  function resetForm() {
    setNome('');
    setTelefone('');
    setEmail('');
    setDataNascimento('');
    setObservacoes('');
    setErrors({});
    setEditingClient(null);
    setShowForm(false);
  }

  function handleEdit(client) {
    setEditingClient(client);
    setNome(client.name);
    setTelefone(client.phone === 'Sem telefone' ? '' : formatPhone(client.phone));
    setEmail(client.email);
    setObservacoes(client.observacoes || '');
    if (client.dataNascimento) {
      setDataNascimento(formatDate(client.dataNascimento.split('T')[0]));
    } else {
      setDataNascimento('');
    }
    setErrors({});
    setShowForm(true);
  }

  async function handleSaveClient() {
    const newErrors = {};

    if (!nome || nome.trim().length < 3) {
      newErrors.nome = 'O nome deve ter pelo menos 3 caracteres.';
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length < 8) {
        newErrors.email = 'E-mail inválido ou muito curto (mínimo 8 caracteres).';
      }
    }

    if (telefone) {
      const phoneClean = telefone.replace(/\D/g, '');
      if (phoneClean.length > 0 && phoneClean.length < 10) {
        newErrors.telefone = 'O telefone deve ter pelo menos 10 dígitos.';
      }
    }

    if (dataNascimento) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dataNascimento)) {
        newErrors.dataNascimento = 'Formato inválido (AAAA-MM-DD).';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Atenção', 'Verifique os erros no formulário.');
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
      if (editingClient) {
        await api.put(`/Cliente/${editingClient.id}`, {
          id: Number(editingClient.id),
          ...clientData,
        });
      } else {
        await api.post('/Cliente', clientData);
      }
      await fetchClients();
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      resetForm();
    }
  }

  function handleDelete(client) {
    const confirmDelete = window.confirm
      ? window.confirm(`Deseja remover o cliente "${client.name}"?`)
      : true;

    if (!confirmDelete) return;

    deleteClient(client.id);
  }

  async function deleteClient(id) {
    try {
      await api.delete(`/Cliente/${id}`);
      fetchClients();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  }

  const filteredClients = clients.map(section => {
    const filteredData = section.data.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery);
      return matchesSearch;
    });
    return { ...section, data: filteredData };
  }).filter(section => section.data.length > 0);

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
        {item.email ? <Text style={styles.clientPhone}>{item.email}</Text> : null}
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
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <AppLitleButton title="Editar" onPress={() => handleEdit(item)} />
            <AppLitleButton title="Excluir" onPress={() => handleDelete(item)} />
        </View>
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

        <View style={{ marginBottom: 16 }}>
          <Button
            title={showForm ? 'Cancelar cadastro' : '+ Novo cliente'}
            onPress={showForm ? resetForm : () => setShowForm(true)}
          />
        </View>

        {showForm && (
          <View style={styles.form}>
            <Input
              label="Nome *"
              placeholder="Ex: Amanda Silva"
              value={nome}
              onChangeText={text => { setNome(text); setErrors(prev => ({...prev, nome: null})); }}
              error={errors.nome}
            />
            <Input
              label="Telefone"
              placeholder="Ex: (11) 9 9999 9999"
              value={telefone}
              onChangeText={text => { setTelefone(formatPhone(text)); setErrors(prev => ({...prev, telefone: null})); }}
              keyboardType="numeric"
              maxLength={16}
              error={errors.telefone}
            />
            <Input
              label="E-mail"
              placeholder="Ex: amanda@email.com"
              value={email}
              onChangeText={text => { setEmail(text); setErrors(prev => ({...prev, email: null})); }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <Input
              label="Data de Nascimento"
              placeholder="Ex: 2000-01-23"
              value={dataNascimento}
              onChangeText={text => { setDataNascimento(formatDate(text)); setErrors(prev => ({...prev, dataNascimento: null})); }}
              type="date"
              maxLength={10}
              error={errors.dataNascimento}
            />
            <Input
              label="Observações"
              placeholder="Alergias, preferências, etc."
              value={observacoes}
              onChangeText={text => { setObservacoes(text); setErrors(prev => ({...prev, observacoes: null})); }}
              multiline={true}
              error={errors.observacoes}
            />
            <Button
              title={editingClient ? 'Salvar alterações' : 'Salvar cliente'}
              onPress={handleSaveClient}
            />
          </View>
        )}

        {!showForm && (
          <>
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
          </>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.roseGold} style={{ flex: 1 }} />
      ) : (
        <SectionList
          sections={filteredClients}
          keyExtractor={(item) => item.id}
          renderItem={renderClientCard}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
      )}

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
  form: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
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
    backgroundColor: '#F3E5D8',
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
    backgroundColor: '#E6C200',
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
