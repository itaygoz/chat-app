import { Matches, MaxLength, MinLength } from 'class-validator';
import { Event } from './event.interface';
import { Subscription } from 'rxjs';

export class Connection implements Event {
  timestamp: Date;
  @MinLength(2)
  @MaxLength(50)
  nickname: string;
  @Matches('room:*')
  room: string;
  clientId: string;
  public subscriptions: Subscription[];
}
