import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { SOCKET_EVENTS } from '@/features/tracking/types/socket.types';

function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
  return apiUrl.replace(/\/api\/v1\/?$/, '');
}

let socket: Socket | null = null;

export function getShipmentSocket(): Socket {
  if (socket) return socket;

  const token = useAuthStore.getState().accessToken;

  socket = io(getSocketUrl(), {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20_000,
  });

  return socket;
}

export function refreshSocketAuth() {
  if (!socket) return;
  const token = useAuthStore.getState().accessToken;
  socket.auth = { token };
}

export function disconnectShipmentSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function subscribeToOrder(socketInstance: Socket, orderId: string) {
  socketInstance.emit(SOCKET_EVENTS.SUBSCRIBE_ORDER, { orderId });
}

export function unsubscribeFromOrder(socketInstance: Socket, orderId: string) {
  socketInstance.emit(SOCKET_EVENTS.UNSUBSCRIBE_ORDER, { orderId });
}

export { SOCKET_EVENTS };
