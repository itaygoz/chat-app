import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, ReplaySubject, Subject, filter, shareReplay } from 'rxjs';
import { Connection, Message, PrivateMessage, Room } from './events';

@Injectable()
/**
 * Handles stream subjects as a real-time database source.
 */
export class ChatRepository {
  private messageSubject = new ReplaySubject<Message>(1000);
  private roomSubject = new Subject<Room>();
  private roomListSubject = new Subject<string[]>();
  private privateMessageSubject = new Subject<PrivateMessage>();

  constructor(private config: ConfigService) {}

  sendMessage(event: Message): void {
    this.messageSubject.next(event);
  }

  sendRoomEvent(event: Room) {
    this.roomSubject.next(event);
  }

  sendRoomListEvent(event: string[]) {
    this.roomListSubject.next(event);
  }

  sendPrivateMessage(event: PrivateMessage) {
    this.privateMessageSubject.next(event);
  }

  getMessagesStream(connection: Connection): Observable<Message> {
    return this.messageSubject.asObservable().pipe(
      filter((event) => event.room === connection.room),
      shareReplay(this.config.get<number>('historyBufferSize')),
    );
  }

  getRoomEventsStream(connection: Connection): Observable<Room> {
    return this.roomSubject
      .asObservable()
      .pipe(filter((event) => event.room === connection.room));
  }

  getRoomListStream(): Observable<string[]> {
    return this.roomListSubject.asObservable();
  }

  getPrivateMessageStream(connection: Connection): Observable<PrivateMessage> {
    return this.privateMessageSubject
      .asObservable()
      .pipe(
        filter(
          (event) =>
            event.destination === connection.clientId ||
            event.clientId === connection.clientId,
        ),
      );
  }
}
