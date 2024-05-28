import { useEffect } from 'react';
import { socket } from '../../socket/config';
import { PrivateMessage } from '../events/PrivateMessage';
import { useChatStore } from './useChatStore';

export const usePrivateMessages = () => {
  const { privateMessages, setPrivateMessages, increasePrivateMessageNotification } = useChatStore(
    (state) => ({
      privateMessages: state.privateMessages,
      setPrivateMessages: state.setPrivateMessages,
      increasePrivateMessageNotification: state.increasePrivateMessageNotification
    })
  );

  useEffect(() => {
    socket.on('private-message', (message: PrivateMessage) => {
      setPrivateMessages(message);
      increasePrivateMessageNotification(message.clientId!);
      console.log('got private message', message);
    });

    return () => {
      socket.off('private-message');
    };
  }, [setPrivateMessages, increasePrivateMessageNotification]);

  return privateMessages;
};
