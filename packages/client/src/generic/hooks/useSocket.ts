import { useEffect } from 'react';
import { socket } from '../../socket/config';

export const useSocket = () => {
  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      console.log('on connect');
    });
    socket.on('disconnect', () => {
      console.log('on disconnect');
    });

    return () => {
      socket.close();
    };
  }, []);
};
