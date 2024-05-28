import { useEffect } from 'react';
import { Message } from '../events/Message';
import { socket } from '../../socket/config';
import { useChatStore } from './useChatStore';

export const useMessages = () => {
  const { messages, setMessages } = useChatStore((state) => ({
    messages: state.messages,
    setMessages: state.setMessages
  }));

  useEffect(() => {
    socket.on('message', (message: Message) => {
      setMessages(message);
    });

    return () => {
      socket.off('message');
    };
  }, [setMessages]);

  return messages;
};
