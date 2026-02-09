import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getHostFromExpo() {
  // Expo Go / dev builds usually provide a hostUri like "192.168.1.10:8081".
  // Prefer that so physical devices can reach the same machine running the API.
  const hostUri =
    Constants?.expoConfig?.hostUri ??
    // Older manifests sometimes expose debuggerHost
    Constants?.manifest?.debuggerHost ??
    Constants?.manifest2?.extra?.expoClient?.hostUri;

  if (typeof hostUri !== 'string' || !hostUri) return null;
  const host = hostUri.split(':')[0];
  return host || null;
}

export function getApiBaseUrl() {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env && env.trim()) return env.trim().replace(/\/$/, '');

  const expoHost = getHostFromExpo();
  if (expoHost) return `http://${expoHost}:8080`;

  // Sensible defaults by platform:
  // - iOS simulator can reach the host machine via localhost
  // - Android emulator must use 10.0.2.2 to reach the host machine
  return Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
}

async function parseJsonResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (${res.status}): ${text}`);
  }
}

export async function apiGet(path) {
  const url = `${getApiBaseUrl()}${path}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const body = await parseJsonResponse(res).catch(() => null);
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? `: ${JSON.stringify(body)}` : ''}`);
  }
  return parseJsonResponse(res);
}

export async function apiPost(path, body) {
  const url = `${getApiBaseUrl()}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    const payload = await parseJsonResponse(res).catch(() => null);
    throw new Error(`HTTP ${res.status} ${res.statusText}${payload ? `: ${JSON.stringify(payload)}` : ''}`);
  }
  return parseJsonResponse(res);
}
