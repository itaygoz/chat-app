import Sidebar, { Element } from '../../generic/components/Sidebar';
import { useConnection } from '../../generic/hooks/useConnection';
import { useChatStore } from '../hooks/useChatStore';

interface UsersSidebarProps {
  privateMessagesUsers: Map<string, Element>;
}

const UsersSidebar = ({ privateMessagesUsers: pmUsers }: UsersSidebarProps) => {
  const { roomInfo, privateRoom, setPrivateRoom, resetNotification } = useChatStore((state) => ({
    roomInfo: state.roomInfo,
    privateRoom: state.privateRoomInfo,
    setPrivateRoom: state.setPrivateRoomInfo,
    resetNotification: state.resetPrivateMessageNotification
  }));
  const connection = useConnection((state) => state.connection);
  const connections = roomInfo?.connections;

  const userClickHandler = (id: string) => {
    // do nothing
    if (
      id === connection?.clientId ||
      id === 'private-header' ||
      id === 'room-header' ||
      id === privateRoom?.destination
    ) {
      return;
    }
    const pmUser = pmUsers?.get(id);
    const newPrivateRoom = {
      destination: id,
      destinationNickname: pmUser?.name ?? connections?.find((c) => c.clientId === id)?.nickname!
    };
    resetNotification(pmUser?.id!);
    setPrivateRoom(newPrivateRoom);
    console.log('setPrivateRoom', newPrivateRoom);
  };

  const getUsers = (): Element[] => {
    let users: Element[] | undefined = connections
      ?.filter((c) => c.clientId !== connection?.clientId)
      .map((c) => ({
        id: c.clientId,
        name: c.nickname
        // style: pmUserIds?.has(c.clientId) ? { color: 'red' } : undefined
      }));

    if (privateRoom && !pmUsers.has(privateRoom.destination)) {
      pmUsers?.set(privateRoom.destination, {
        id: privateRoom.destination,
        key: `private_${privateRoom.destination}`,
        name: privateRoom.destinationNickname
      });
    }

    const pm = pmUsers?.size
      ? Array.from(pmUsers.values())
          .filter((pmUser) => pmUser.id !== connection?.clientId)
          .map((pmUser) =>
            pmUser.id === privateRoom?.destination
              ? {
                  ...pmUser,
                  style: { fontWeight: 800 }
                }
              : pmUser
          )
      : [];

    return [
      { id: connection?.clientId!, name: 'You', style: { fontWeight: 800 } },
      ...(pmUsers?.size
        ? [
            {
              id: 'private-header',
              name: 'Private Conversations',
              style: { fontWeight: 600, color: 'grey', cursor: 'default', padding: '0px' }
            },
            ...pm
          ]
        : []),
      ...(users?.length && !privateRoom
        ? [
            {
              id: 'room-header',
              name: 'Room Users',
              style: { fontWeight: 600, color: 'grey', cursor: 'default', padding: '0px' }
            },
            ...users
          ]
        : [])
    ];
  };
  return (
    <div>
      <Sidebar
        elements={getUsers()}
        clickHandler={userClickHandler}
        position="right"
        header="Users"
      />
    </div>
  );
};

export default UsersSidebar;
