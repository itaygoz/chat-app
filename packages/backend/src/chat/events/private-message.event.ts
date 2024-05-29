import { Message } from './message.event';

export class PrivateMessage extends Message {
  destination: string;
}
