import { API_BASE_URL } from '../config/api';
import type {
  AuthResponse,
  Booking,
  CreateBookingPayload,
  LoginPayload,
  OAuthLoginPayload,
  Provider,
  RegisterPayload
} from '../types';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorMessage(payload: unknown, fallbackMessage: string): string {
  if (!payload) {
    return fallbackMessage;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (isRecord(payload)) {
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    if (typeof payload.title === 'string' && payload.title.trim()) {
      return payload.title;
    }

    if (isRecord(payload.errors)) {
      for (const errorSet of Object.values(payload.errors)) {
        if (Array.isArray(errorSet) && typeof errorSet[0] === 'string') {
          return errorSet[0];
        }
      }
    }
  }

  return fallbackMessage;
}

async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

async function request<TResponse>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<TResponse> {
  const headers: Record<string, string> = {
    Accept: 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, `Request failed with status ${response.status}.`));
  }

  return payload as TResponse;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload
    }),
  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload
    }),
  oauthLogin: (payload: OAuthLoginPayload) =>
    request<AuthResponse>('/auth/oauth', {
      method: 'POST',
      body: payload
    })
};

export const providersApi = {
  list: () => request<Provider[]>('/providers')
};

export const bookingsApi = {
  create: (payload: CreateBookingPayload, token: string) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: payload,
      token
    }),
  listByUserId: (userId: string, token: string) =>
    request<Booking[]>(`/bookings/${userId}`, {
      token
    }),
  accept: (bookingId: Booking['id'], token: string) =>
    request<Booking>(`/bookings/${bookingId}/accept`, {
      method: 'PUT',
      token
    }),
  start: (bookingId: Booking['id'], token: string) =>
    request<Booking>(`/bookings/${bookingId}/start`, {
      method: 'PUT',
      token
    }),
  complete: (bookingId: Booking['id'], token: string) =>
    request<Booking>(`/bookings/${bookingId}/complete`, {
      method: 'PUT',
      token
    })
};
