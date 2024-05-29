import { Matches, MaxLength } from 'class-validator';
import { Event } from './event.interface';

export class Message implements Event {
  clientId: string;
  timestamp: Date;
  nickname: string;
  @MaxLength(500)
  message: string;
  @Matches('room:*')
  room: string;
}
