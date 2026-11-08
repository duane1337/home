type TelegramServerless = {
  call<T>(name: string, input?: Record<string, unknown>): Promise<T>;
};

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: {
      Serverless?: TelegramServerless;
    };
  };
};

export function callEndpoint<T>(name: string, input: Record<string, unknown> = {}): Promise<T> {
  const serverless = (window as TelegramWindow).Telegram?.WebApp?.Serverless;
  if (!serverless) {
    return Promise.reject(new Error('Open HomePilot inside Telegram to use cloud endpoints.'));
  }
  return serverless.call<T>(name, input);
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
