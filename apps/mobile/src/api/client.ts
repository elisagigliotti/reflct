// Client HTTP verso backend/api. Token JWT persistito con expo-secure-store
// (piu' corretto di AsyncStorage per un token di sessione).
//
// NOTA su API_BASE_URL: "localhost" dal punto di vista del telefono/emulatore
// NON e' la macchina di sviluppo. Su Android emulator usare 10.0.2.2, su
// device fisico l'IP LAN del computer (es. 192.168.1.23). Configurabile senza
// toccare il codice con la variabile d'ambiente EXPO_PUBLIC_API_URL (Expo la
// inlinea automaticamente a build-time se definita in un file .env).
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

const TOKEN_KEY = 'reflct_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}, withAuth = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (withAuth) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, 'Impossibile contattare il server. Controlla la connessione.');
  }

  if (!response.ok) {
    let message = `Errore ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) {
        message = body.message;
      }
    } catch {
      // corpo non JSON: si tiene il messaggio generico
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown, withAuth = true) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, withAuth),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
};
