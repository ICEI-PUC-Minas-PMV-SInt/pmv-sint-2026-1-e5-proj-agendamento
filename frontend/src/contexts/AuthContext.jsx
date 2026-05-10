import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, registerUnauthorizedHandler } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove(['token', 'usuario']);
    setUsuario(null);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => { signOut(); });
  }, [signOut]);

  useEffect(() => {
    (async () => {
      try {
        const [tokenPair, usuarioPair] = await AsyncStorage.multiGet(['token', 'usuario']);
        const token = tokenPair?.[1];
        const cached = usuarioPair?.[1];

        if (!token) {
          setUsuario(null);
          return;
        }

        if (cached) setUsuario(JSON.parse(cached));

        try {
          const fresh = await api.get('/Auth/me');
          setUsuario(fresh);
          await AsyncStorage.setItem('usuario', JSON.stringify(fresh));
        } catch {
          await signOut();
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [signOut]);

  async function signIn(email, senha) {
    const data = await api.post('/Auth/login', { email, senha });
    const usuarioData = {
      id: data.id,
      nome: data.nome,
      email: data.email,
      role: data.role,
    };
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('usuario', JSON.stringify(usuarioData));
    setUsuario(usuarioData);
    return usuarioData;
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
