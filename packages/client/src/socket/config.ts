import { io } from 'socket.io-client';

const URL = 'localhost:3001';

export const socket = io(URL, { autoConnect: false });
