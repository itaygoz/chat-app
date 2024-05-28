import { create } from 'zustand';
import { Room } from '../events/Room';
import { Message } from '../events/Message';
import { PrivateMessage } from '../events/PrivateMessage';
import { PrivateRoom } from '../events/PrivateRoom';
import { enableMapSet, produce } from 'immer';

type ChatStore = {
  rooms: string[] | undefined;
  setRooms: (rooms: string[]) => void;
  roomInfo: Room | undefined;
  setRoomInfo: (room: Room) => void;
  messages: Message[] | undefined;
  setMessages: (message: Message) => void;
  cleanMessages: () => void;
  privateMessages: PrivateMessage[] | undefined;
  setPrivateMessages: (message: PrivateMessage) => void;
  privateRoomInfo: PrivateRoom | undefined;
  setPrivateRoomInfo: (room: PrivateRoom | undefined) => void;
  privateMessageNotifications: Map<string, number>;
  increasePrivateMessageNotification: (id: string) => void;
  resetPrivateMessageNotification: (id: string) => void;
};
enableMapSet();
export const useChatStore = create<ChatStore>((set) => ({
  rooms: undefined,
  setRooms: (rooms: string[]) => set({ rooms }),
  roomInfo: undefined,
  setRoomInfo: (roomInfo) => set({ roomInfo }),
  messages: undefined,
  setMessages: (message) =>
    set((state) => ({ messages: state.messages ? [...state.messages, message] : [message] })),
  cleanMessages: () => set({ messages: [] }),
  privateMessages: undefined,
  setPrivateMessages: (message) =>
    set((state) => ({
      privateMessages: state.privateMessages ? [...state.privateMessages, message] : [message]
    })),
  privateRoomInfo: undefined,
  setPrivateRoomInfo: (privateRoomInfo) => set({ privateRoomInfo }),
  privateMessageNotifications: new Map<string, number>(),
  increasePrivateMessageNotification: (id) => {
    set(
      produce((state: ChatStore) => {
        let count = state.privateMessageNotifications.get(id);
        void state.privateMessageNotifications.set(id, count ? ++count : 1);
      })
    );
  },
  resetPrivateMessageNotification: (id) => {
    set(
      produce((state: ChatStore) => {
        void state.privateMessageNotifications.delete(id);
      })
    );
  }
}));
