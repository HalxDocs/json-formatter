// utils/notify.ts

export type NotifyType = "success" | "error" | "warning" | "info";

interface NotifyPayload {
  id?: string;
  type: NotifyType;
  message: string;
  duration?: number;
}

// Simple event emitter pattern
type Listener = (payload: NotifyPayload) => void;

const listeners: Listener[] = [];

export function notify(payload: NotifyPayload) {
  listeners.forEach((fn) => fn(payload));
}

export function onNotify(listener: Listener) {
  listeners.push(listener);

  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
  };
}
