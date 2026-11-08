type TelegramWindow = Window & { Telegram?: { WebApp?: { initData?: string } } };

const API_KEY = 'homepilot_api_url';
export function getApiUrl() {
  return (localStorage.getItem(API_KEY) || '').trim().replace(/\/$/, '');
}
export function setApiUrl(value: string) {
  localStorage.setItem(API_KEY, value.trim().replace(/\/$/, ''));
}
async function request<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const base = getApiUrl();
  if (!base) throw new Error('Set your HomePilot server URL in Settings first.');
  const initData = (window as TelegramWindow).Telegram?.WebApp?.initData;
  if (!initData) throw new Error('Open HomePilot from its Telegram bot to authorize this device.');
  const response = await fetch(base + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: 'tma ' + initData },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || 'HomePilot server request failed.');
  return data as T;
}
export type HomeState = { product: string; version: string; agent: { status: 'online' | 'offline' }; capabilities: Record<string, boolean> };
export type QueuedCommand = { id: string; status: string; delivered: boolean; reason?: string };
export function getHome() { return request<HomeState>('/api/health'); }
export function queueCommand(action: string, payload: Record<string, unknown> = {}) {
  return request<QueuedCommand>('/api/command', { action, payload });
}
