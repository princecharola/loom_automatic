import { io } from 'socket.io-client';
import { Platform } from 'react-native';

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL || `http://${defaultHost}:4000`, {
  transports: ['websocket']
});
