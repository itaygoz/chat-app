import { Connection } from '../generic/events/Connection';
import { Message } from '../chat/events/Message';
import { socket } from './config';
import { PrivateMessage } from '../chat/events/PrivateMessage';

export const register = (nickname: string, roomId: string) => {
  const connection: Connection = {
    nickname,
    room: roomId
  } as Connection;
  socket.emit('register', connection);

  console.log('register', connection);
};

export const sendMessage = (message: Message) => {
  socket.send(message);
  console.log('sendMessage', message);
};

export const sendPrivateMessage = (message: PrivateMessage) => {
  socket.emit('private-message', message);
  console.log('sendPrivateMessage', message);
};
