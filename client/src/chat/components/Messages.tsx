import { Fragment, useEffect, useRef } from 'react';
import { Message } from '../events/Message';
import { PrivateMessage } from '../events/PrivateMessage';

interface MessagesProps {
  messages?: Message[] | PrivateMessage[];
  connectionClientId: string;
}

export const Messages = ({ messages, connectionClientId }: MessagesProps) => {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);
  const renderMessage = (message: Message) => {
    const time = message.timestamp ?? new Date().toISOString();
    const displayTime = new Date(time).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });

    if (message.nickname === 'system') {
      return (
        <div key={time} className="system-message">
          <strong> {message.message} </strong>
        </div>
      );
    }

    if (connectionClientId === message?.clientId) {
      return (
        <Fragment key={time}>
          <p className="sender-right">You</p>
          <div className="message-right">
            <p className="message-time">{displayTime}</p>
            {message.message}
          </div>
        </Fragment>
      );
    }
    return (
      <Fragment key={time}>
        <p className="sender">{message.nickname}</p>
        <div className="message">
          <p className="message-time">{displayTime}</p>
          {message.message}
        </div>
      </Fragment>
    );
  };
  return (
    <div className="chat-box" ref={chatBoxRef}>
      {messages?.map(renderMessage)}
    </div>
  );
};
