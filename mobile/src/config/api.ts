import { Platform } from 'react-native';

const configuredApiUrl =
  typeof process !== 'undefined' && typeof process.env?.EXPO_PUBLIC_API_URL === 'string'
    ? process.env.EXPO_PUBLIC_API_URL.trim()
    : '';

const defaultApiUrl =
  Platform.select({
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api'
  }) ?? 'http://localhost:5000/api';

export const API_BASE_URL = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, '');
