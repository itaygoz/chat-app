import { useState } from 'react';
import Sidebar from '../../generic/components/Sidebar';
import { useConnection } from '../../generic/hooks/useConnection';
import { register } from '../../socket/actions';
import { useChatStore } from '../hooks/useChatStore';
import CreateRoomModal from './CreateRoomModal';

const RoomsSidebar = () => {
  const { rooms, privateRoom, setPrivateRoom } = useChatStore((state) => ({
    rooms: state.rooms,
    privateRoom: state.privateRoomInfo,
    setPrivateRoom: state.setPrivateRoomInfo
  }));
  const { connection, setConnection } = useConnection();
  const cleanMessages = useChatStore((state) => state.cleanMessages);
  const [showModal, setShowModal] = useState(false);

  const roomClickHandler = (id: string) => {
    // No room changed do nothing
    if (connection?.room === id && !privateRoom) {
      return;
    }

    if (id === 'create-room') {
      console.log('create new room');
      setShowModal(true);
      return;
    }

    changeRoom(id);
  };

  const changeRoom = (room: string) => {
    console.log('change room', room);
    if (privateRoom) {
      // exit private room
      return setPrivateRoom(undefined);
    }
    setConnection({
      ...connection!,
      room: room
    });
    register(connection?.nickname!, room);
    cleanMessages();
  };

  const getRooms = () => {
    const roomElements = rooms?.map((room) => ({
      id: room,
      name: room.replace('room:', ''),
      style: connection?.room === room && !privateRoom ? { fontWeight: 800 } : undefined
    }));

    return roomElements
      ? [...roomElements, { id: 'create-room', name: '+ create room' }]
      : [{ id: 'create-room', name: '+create room' }];
  };

  return (
    <>
      <div>
        <Sidebar
          elements={getRooms()}
          clickHandler={roomClickHandler}
          position="left"
          header="Rooms"
        />
      </div>
      <div>
        {showModal && (
          <CreateRoomModal closeFunc={() => setShowModal(false)} createRoom={changeRoom} />
        )}
      </div>
    </>
  );
};

export default RoomsSidebar;
