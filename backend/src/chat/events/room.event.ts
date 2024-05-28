import { Connection } from './connection.event';
import { Event } from './event.interface';

export class Room implements Event {
  clientId: string;
  timestamp: Date;
  room: string;
  connections: Connection[];
}
