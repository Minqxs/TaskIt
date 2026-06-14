import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
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

function decodeBase64Url(value: string): string {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalizedValue.length % 4)) % 4);
  const base64 = normalizedValue + padding;

  if (typeof atob === 'function') {
    return atob(base64);
  }

  return '';
}

function isTokenExpired(token: string): boolean {
  const [, payload] = token.split('.');
  if (!payload) {
    return true;
  }

  try {
    const decodedPayload = JSON.parse(decodeBase64Url(payload)) as { exp?: unknown };
    if (typeof decodedPayload.exp !== 'number') {
      return true;
    }

    return decodedPayload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

async function setStoredValue(value: string): Promise<void> {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(SESSION_STORAGE_KEY, value);
}

async function getStoredValue(): Promise<string | null> {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  }

  return SecureStore.getItemAsync(SESSION_STORAGE_KEY);
}

async function removeStoredValue(): Promise<void> {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
}

export async function saveStoredSession(session: Session): Promise<void> {
  await setStoredValue(JSON.stringify(session));
}

export async function loadStoredSession(): Promise<Session | null> {
  const serializedSession = await getStoredValue();
  if (!serializedSession) {
    return null;
  }

  try {
    const parsedSession: unknown = JSON.parse(serializedSession);

    if (!isSession(parsedSession) || isTokenExpired(parsedSession.token)) {
      await removeStoredValue();
      return null;
    }

    return parsedSession;
  } catch {
    await removeStoredValue();
    return null;
  }
}

export async function clearStoredSession(): Promise<void> {
  await removeStoredValue();
}
