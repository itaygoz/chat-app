import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'socket.io-client';
import { ChatService } from './chat.service';
import { Connection } from './events/connection.event';
import { Message } from './events/message.event';
import {
  UseFilters,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatInterceptor } from './chat.interceptor';
import { WsExceptionsFilter } from './ws-exception.filter';
import { ChatRepository } from './chat.repository';
import { PrivateMessage } from './events';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseInterceptors(ChatInterceptor)
@UsePipes(ValidationPipe)
@UseFilters(WsExceptionsFilter)
export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer() server: Server;
  constructor(
    private readonly service: ChatService,
    private readonly repository: ChatRepository,
  ) {}
  handleConnection(client: Socket) {
    return this.service.notifyRoomChange(this.server, client);
  }
  handleDisconnect(client: Socket) {
    return this.service.removeUserFromRoom(client.id, this.server);
  }

  @SubscribeMessage('register')
  async connectRoom(
    @MessageBody() connection: Connection,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.service.registerRoom(connection, socket, this.server);
  }

  @SubscribeMessage('message')
  message(@MessageBody() message: Message) {
    this.repository.sendMessage(message);
  }

  @SubscribeMessage('private-message')
  privateMessage(@MessageBody() message: PrivateMessage) {
    return this.service.sendPrivateMessage(message);
  }

  @SubscribeMessage('exit-room')
  exitRoom(@ConnectedSocket() client: Socket) {
    return this.service.removeUserFromRoom(client.id, this.server);
  }
}
