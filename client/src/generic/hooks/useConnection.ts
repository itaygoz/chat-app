import { create } from 'zustand';
import { Connection } from '../events/Connection';

type ConnectionStore = {
  connection: Connection | undefined;
  setConnection: (connection?: Connection) => void;
};

export const useConnection = create<ConnectionStore>((set) => ({
  connection: undefined,
  setConnection: (connection) => set({ connection })
}));
