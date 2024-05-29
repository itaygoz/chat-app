import { Message } from './Message';

export interface PrivateMessage extends Message {
  destination: string;
}
