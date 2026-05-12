import AsyncStorage from '@react-native-async-storage/async-storage';

// Em produção, defina EXPO_PUBLIC_API_URL com a URL pública do backend (ex:
// https://studio-lash-api.fly.dev/api). Localmente, usa o backend em localhost.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5034/api';

let onUnauthorized = null;
export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function getToken() {
  return AsyncStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = await getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    if (onUnauthorized) onUnauthorized();
    throw new Error('[HTTP 401] Sessão expirada. Faça login novamente.');
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    data = text;
  }

  if (!response.ok) {
    let backendMessage = 'Erro desconhecido';

    if (typeof data === 'object' && data !== null) {
      if (data.errors) {
        backendMessage = Object.entries(data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
      } else {
        backendMessage = data.message || data.title || JSON.stringify(data);
      }
    } else {
      backendMessage = data;
    }

    const errorMessage = backendMessage
      ? `[HTTP ${response.status}] ${backendMessage}`
      : `Erro HTTP ${response.status}`;
    const err = new Error(errorMessage);
    err.status = response.status;
    err.payload = data;
    throw err;
  }

  return data;
}

export const api = {
  get:    (path)        => request(path),
  post:   (path, body)  => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)  => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body)  => request(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path)        => request(path, { method: 'DELETE' }),
};
