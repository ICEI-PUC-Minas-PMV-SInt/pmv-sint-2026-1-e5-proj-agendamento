import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';

import Input from '../components/Input';
import Button from '../components/Button';
import { api } from '../services/api';
import { colors } from '../theme/colors';
import AppLitleButton from '../components/LitleButton';
import BottomMenu from '../components/BottomMenu';

export default function ServicesScreen({ navigation }) {
    const [services, setServices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [duracaoMinutos, setDuracaoMinutos] = useState('');

    async function loadServices() {
        try {
            const data = await api.get('/Servico');
            setServices(data);
        } catch (error) {
            Alert.alert('Erro', error.message);
        }
    }

    function resetForm() {
        setNome('');
        setDescricao('');
        setPreco('');
        setDuracaoMinutos('');
        setEditingService(null);
        setShowForm(false);
    }

    function handleEdit(service) {
        setEditingService(service);
        setNome(service.nome);
        setDescricao(service.descricao || '');
        setPreco(String(service.preco));
        setDuracaoMinutos(String(service.duracaoMinutos));
        setShowForm(true);
    }

    async function handleSaveService() {
        if (!nome || !preco || !duracaoMinutos) {
            Alert.alert('Atenção', 'Preencha nome, preço e duração.');
            return;
        }

        const serviceData = {
            nome,
            descricao,
            duracaoMinutos: Number(duracaoMinutos),
            preco: Number(preco),
            ativo: true,
        };

        try {
            if (editingService) {
                await api.put(`/Servico/${editingService.id}`, {
                    id: editingService.id,
                    ...serviceData,
                });
            } else {
                await api.post('/Servico', serviceData);
            }

            await loadServices();
        } catch (error) {
            Alert.alert('Erro', error.message);
        } finally {
            resetForm();
        }

    }

    function handleDelete(service) {
        const confirmDelete = window.confirm
            ? window.confirm(`Deseja remover o serviço "${service.nome}"?`)
            : true;

        if (!confirmDelete) return;

        deleteService(service.id);
    }

    async function deleteService(id) {
        try {
            await api.delete(`/Servico/${id}`);
            loadServices();
        } catch (error) {
            Alert.alert('Erro', error.message);
        }
    }

    useEffect(() => {
        loadServices();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Catálogo de Serviços</Text>

            <View style={{ width: '100%', maxWidth: 400 }}>
                <Button
                    title={showForm ? 'Cancelar cadastro' : '+ Novo serviço'}
                    onPress={showForm ? resetForm : () => setShowForm(true)}
                />
            </View>

            {showForm && (
                <View style={styles.form}>
                    <Input
                        label="Nome"
                        placeholder="Ex: Volume Brasileiro"
                        value={nome}
                        onChangeText={setNome}
                    />

                    <Input
                        label="Descrição"
                        placeholder="Descreva o serviço"
                        value={descricao}
                        onChangeText={setDescricao}
                        multiline
                    />

                    <Input
                        label="Preço"
                        placeholder="Ex: 180"
                        value={preco}
                        onChangeText={setPreco}
                        keyboardType="numeric"
                    />

                    <Input
                        label="Duração em minutos"
                        placeholder="Ex: 120"
                        value={duracaoMinutos}
                        onChangeText={setDuracaoMinutos}
                        keyboardType="numeric"
                    />

                    <Button
                        title={editingService ? 'Salvar alterações' : 'Salvar serviço'}
                        onPress={handleSaveService}
                    />
                </View>
            )}

            <FlatList
                data={services}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.serviceName}>{item.nome}</Text>

                        {item.descricao ? (
                            <Text style={styles.description}>{item.descricao}</Text>
                        ) : null}

                        <View style={styles.infoRow}>
                            <Text style={styles.info}>{item.duracaoMinutos} min</Text>
                            <Text style={styles.info}>R$ {item.preco}</Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <AppLitleButton title="Editar" onPress={() => handleEdit(item)} />
                            <AppLitleButton title="Excluir" onPress={() => handleDelete(item)} />
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>Nenhum serviço cadastrado.</Text>
                }
            />
            <BottomMenu active="Services" navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 32,
        fontFamily: 'BodoniModa_700Bold',
        color: colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    form: {
        marginTop: 16,
        marginBottom: 20,
        padding: 16,
        backgroundColor: colors.white,
        borderRadius: 16,

        width: '100%',
        maxWidth: 400, // 👈 importante
    },
    list: {
        paddingTop: 20,
        paddingBottom: 40,
        width: '100%',
        maxWidth: 400,
        paddingBottom: 120,
    },
    card: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: colors.mutedText,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    info: {
        backgroundColor: colors.beige,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        color: colors.text,
        fontSize: 13,
    },
    actions: {
        gap: 8,
    },
    empty: {
        textAlign: 'center',
        color: colors.mutedText,
        marginTop: 30,
    },
});