type ServerlessResult<T> = (error: { message?: string; type?: string } | null, result?: T) => void;
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        Serverless?: { call<T>(name: string, input: Record<string, unknown>, callback: ServerlessResult<T>): void };
      };
    };
  }
}
export function callEndpoint<T>(name: string, input: Record<string, unknown> = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const call = window.Telegram?.WebApp?.Serverless?.call;
    if (!call) {
      reject(new Error('Open HomePilot inside Telegram to use cloud endpoints.'));
      return;
    }
    call<T>(name, input, (error, result) => {
      if (error) reject(new Error(error.message || 'Telegram Serverless request failed'));
      else resolve(result as T);
    });
  });
}
export type HomeState = {
  product: string;
  version: string;
  agent: { status: 'online' | 'offline' };
  capabilities: Record<string, boolean>;
};
export type QueuedCommand = { id: string; status: string; delivered: boolean; reason?: string };
export function getHome() { return callEndpoint<HomeState>('getHome'); }
export function queueCommand(action: string, payload: Record<string, unknown> = {}) {
  return callEndpoint<QueuedCommand>('queueCommand', { action, payload });
}
