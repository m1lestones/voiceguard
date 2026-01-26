export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
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
