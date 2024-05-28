import { Connection } from '../../generic/events/Connection';

export type Room = {
  clientId: string;
  timestamp: Date;
  room: string;
  connections: Connection[];
};
