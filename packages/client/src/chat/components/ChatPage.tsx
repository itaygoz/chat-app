import { CSSProperties, useEffect, useState } from 'react';
import { Element } from '../../generic/components/Sidebar';
import { useConnection } from '../../generic/hooks/useConnection';
import { useErrorsState } from '../../generic/hooks/useErrors';
import { Message } from '../events/Message';
import { useChatStore } from '../hooks/useChatStore';
import { useMessages } from '../hooks/useMessages';
import { usePrivateMessages } from '../hooks/usePrivateMessages';
import { ChatMessageInput } from './ChatMessageInput';
import { Messages } from './Messages';
import RoomsSidebar from './RoomsSidebar';
import UsersSidebar from './UsersSidebar';

const errorPath = 'message';

const ChatPage = () => {
  const messages = useMessages();
  const privateMessages = usePrivateMessages();
  const { errors, resetErrors } = useErrorsState(errorPath);
  const { connection } = useConnection();
  const { privateRoom, pmNotification } = useChatStore((state) => ({
    privateRoom: state.privateRoomInfo,
    pmNotification: state.privateMessageNotifications
  }));

  const [pmUsers, setPmUsers] = useState(new Map<string, Element>());

  useEffect(() => {
    const notificationStyle: CSSProperties = {
      backgroundColor: 'red',
      color: '#fff',
      fontWeight: 'bold',
      borderRadius: '50%',
      padding: '3px 6px',
      textAlign: 'center',
      marginLeft: '5px',
      fontSize: '10px'
    };
    privateMessages?.forEach((pm) => {
      const notification = pmNotification.get(pm.clientId!);
      setPmUsers((map) =>
        pmUsers.set(pm.clientId!, {
          key: `private_${pm.clientId}`,
          id: pm.clientId!,
          name: pm.nickname,
          notification:
            notification && privateRoom?.destination !== pm.clientId
              ? { content: notification.toString(), style: notificationStyle }
              : undefined
        })
      );
    });
  }, [privateMessages, pmUsers, setPmUsers, pmNotification, privateRoom]);

  useEffect(() => {
    if (errors) {
      console.log('ChatBox with errors: ', errors);
      resetErrors();
    }
  }, [errors, resetErrors]);

  const getMessages = () => {
    if (privateRoom) {
      const startPrivateConversationMessage: Message = {
        message: 'Started private conversation with ' + privateRoom.destinationNickname,
        nickname: 'system',
        timestamp: new Date().toISOString(),
        room: 'private'
      };

      return privateMessages
        ? [
            startPrivateConversationMessage,
            ...privateMessages.filter(
              (message) =>
                message.destination === privateRoom.destination ||
                message.clientId === privateRoom.destination
            )
          ]
        : [startPrivateConversationMessage];
    }
    return messages;
  };

  return (
    <div className="page-container">
      <RoomsSidebar />
      <div className="chat-box-container">
        <Messages connectionClientId={connection?.clientId!} messages={getMessages()} />
        <ChatMessageInput />
      </div>
      <UsersSidebar privateMessagesUsers={pmUsers} />
    </div>
  );
};

export default ChatPage;
