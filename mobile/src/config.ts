import { Platform } from 'react-native';

export const STORAGE_KEYS = {
  devServerUrl: 'ironpath_dev_server_url',
} as const;

/** Default IronPath dev server URL per platform (Express + Vite on port 3000). */
export function getDefaultDevServerUrl(): string {
  if (Platform.OS === 'android') {
    // Android emulator alias for the host machine
    return 'http://10.0.2.2:3000';
  }
  // iOS simulator, Expo Go on same machine, and web
  return 'http://localhost:3000';
}

export function normalizeDevServerUrl(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, '');
  if (!trimmed) {
    throw new Error('URL cannot be empty');
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return `http://${trimmed}`;
  }
  return trimmed;
}
