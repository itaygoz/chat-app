import { useState } from 'react';
import { useConnection } from '../../generic/hooks/useConnection';
import { sendMessage, sendPrivateMessage } from '../../socket/actions';
import { Message } from '../events/Message';
import { useChatStore } from '../hooks/useChatStore';

export const ChatMessageInput = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const { connection } = useConnection();
  const privateRoom = useChatStore((state) => state.privateRoomInfo);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim() !== '') {
      addMessage(inputValue);
      setInputValue('');
    }
  };

  const addMessage = (messageText: string) => {
    const newMessage: Message = {
      nickname: connection?.nickname!,
      message: messageText,
      room: connection?.room!
    };

    if (privateRoom) {
      return sendPrivateMessage({
        ...newMessage,
        destination: privateRoom.destination
      });
    }

    return sendMessage(newMessage);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type your message..."
        className="message-input"
        autoFocus
      />
      <button type="submit" className="add-message-button">
        Send
      </button>
    </form>
  );
};
