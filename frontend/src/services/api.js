import AsyncStorage from '@react-native-async-storage/async-storage';

//const BASE_URL = 'http://10.0.2.2:5000/api'; // Android Emulator → localhost
const BASE_URL = 'http://localhost:5034/api'; // quando estiver usando pwla web
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
        // Formata os erros do ASP.NET Core: "Campo: Erro 1, Erro 2"
        backendMessage = Object.entries(data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
      } else {
        backendMessage = data.message || data.title || JSON.stringify(data);
      }
    } else {
      backendMessage = data;
    }

    const errorMessage = backendMessage ? `[HTTP ${response.status}] ${backendMessage}` : `Erro HTTP ${response.status}`;
    console.error('API Error:', { path, status: response.status, backendMessage, originalData: data });
    throw new Error(errorMessage);
  }

  return data;
}

export const api = {
  get:    (path)        => request(path),
  post:   (path, body)  => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)  => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path)        => request(path, { method: 'PATCH' }),
  delete: (path)        => request(path, { method: 'DELETE' }),
};
