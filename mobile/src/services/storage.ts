import * as SecureStore from 'expo-secure-store';
import type { Session } from '../types';

const SESSION_STORAGE_KEY = 'hometasksa.session';

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.token === 'string' &&
    typeof candidate.userId === 'string' &&
    (candidate.role === 'Customer' || candidate.role === 'ServiceProvider')
  );
}

export async function saveStoredSession(session: Session): Promise<void> {
  await SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function loadStoredSession(): Promise<Session | null> {
  const serializedSession = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
  if (!serializedSession) {
    return null;
  }

  try {
    const parsedSession: unknown = JSON.parse(serializedSession);

    if (!isSession(parsedSession)) {
      await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
      return null;
    }

    return parsedSession;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
    return null;
  }
}

export async function clearStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
}
