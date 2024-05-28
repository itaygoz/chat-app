import { useErrors } from '../../generic/hooks/useErrors';
import { useRooms } from './useRooms';

export const useListeners = () => {
  useRooms();
  useErrors();
};
