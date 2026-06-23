/**
 * Centralized frontend configuration and API key helpers.
 * Keys are stored in localStorage or sent via the backend proxy — never bundled into the client.
 */

import { getStorageItem, removeStorageItem, setStorageItem } from '../utils/storage';

export const GEMINI_API_KEY_STORAGE = 'gemini_api_key';
const PLACEHOLDER_KEY = 'your_gemini_api_key_here';

/** Strip whitespace and non-printable characters from pasted keys. */
export function sanitizeApiKey(raw: string): string {
  return raw.replace(/[\r\n\t ]+/g, '').replace(/[^\x21-\x7E]/g, '');
}

/** Parse a pasted .env line or raw key string into a clean API key. */
export function parseApiKeyInput(raw: string): string {
  let sanitized = raw.replace(/[\r\n]+/g, '').trim();
  const envLineMatch = sanitized.match(
    /(?:GEMINI_API_KEY|VITE_GEMINI_API_KEY)\s*=\s*(['"]?)([A-Za-z0-9_.-]+)\1/
  );
  if (envLineMatch?.[2]) {
    return envLineMatch[2];
  }
  sanitized = sanitized.replace(/^['"]|['"]$/g, '');
  return sanitizeApiKey(sanitized.split(/\s+/)[0] ?? '');
}

/** Read the user's locally stored Gemini API key, if any. */
export function getGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  const stored = getStorageItem(GEMINI_API_KEY_STORAGE);
  return stored ? sanitizeApiKey(stored) : '';
}

/** Persist or clear the user's local Gemini API key. */
export function setGeminiApiKey(key: string | null): void {
  if (typeof window === 'undefined') return;
  const sanitized = key ? parseApiKeyInput(key) : '';
  if (sanitized && sanitized !== PLACEHOLDER_KEY) {
    setStorageItem(GEMINI_API_KEY_STORAGE, sanitized);
  } else {
    removeStorageItem(GEMINI_API_KEY_STORAGE);
  }
}

/** Build fetch headers with the optional custom API key. */
export function geminiRequestHeaders(): Record<string, string> {
  const apiKey = getGeminiApiKey();
  return {
    'Content-Type': 'application/json',
    ...(apiKey && { 'X-Gemini-Key': apiKey }),
  };
}

export const env = {
  isDev: import.meta.env.DEV,
  placeholderKey: PLACEHOLDER_KEY,
};
