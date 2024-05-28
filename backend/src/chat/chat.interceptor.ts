import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io-client';
import { Event } from './events/event.interface';

@Injectable()
/**
 * This Interceptor purpose is to enrich the event data with the client id and timestamp
 */
export class ChatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const wsContext = context.switchToWs();
    const client: Socket = wsContext.getClient();
    const event: Event = wsContext.getData();

    event.clientId = client.id;
    event.timestamp = new Date();

    return next.handle();
  }
}
