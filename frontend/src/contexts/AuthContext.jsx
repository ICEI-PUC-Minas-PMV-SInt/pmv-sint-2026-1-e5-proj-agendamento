import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('usuario').then(json => {
      if (json) setUsuario(JSON.parse(json));
      setLoading(false);
    });
  }, []);

  async function login(email, senha) {
    const data = await api.post('/auth/login', { email, senha });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('usuario', JSON.stringify(data));
    setUsuario(data);
  }

  async function logout() {
    await AsyncStorage.multiRemove(['token', 'usuario']);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
