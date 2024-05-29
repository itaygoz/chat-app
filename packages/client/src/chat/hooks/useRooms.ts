import { useEffect } from 'react';
import { useChatStore } from './useChatStore';
import { socket } from '../../socket/config';
import { Room } from '../events/Room';

export const useRooms = () => {
  const { setRoomInfo, setRooms } = useChatStore((state) => ({
    setRoomInfo: state.setRoomInfo,
    setRooms: state.setRooms
  }));

  useEffect(() => {
    socket.on('room', (room: Room) => {
      console.log('roomInfo', room);
      setRoomInfo(room);
    });
    socket.on('room-list', ({ rooms }) => {
      console.log('rooms', rooms);
      setRooms(rooms);
    });

    return () => {
      socket.off('room');
      socket.off('room-list');
    };
  }, [setRoomInfo, setRooms]);
};
