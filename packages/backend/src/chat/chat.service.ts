import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Server } from 'socket.io';
import { Socket } from 'socket.io-client';
import { ChatRepository } from './chat.repository';
import { Connection, PrivateMessage } from './events';

/**
 * ## This service handles the chat subscriptions
 * The chat handles multiple events as follows:
 * - `message` emits and listen to incoming chat messages
 * - `private-message` emits and listen to incoming chat private messages
 * - `room-list` emits all existing rooms, notify rooms-change in real time
 * - `room` emits all the clients in the room, notify room-change in real time
 * ---
 * ### usage Instructions
 * 1. Make a connection -> you'll trigger the room-list event
 * 2. register to a room -> you'll subscribe to all events, usage example:
 * ```ts
 * await this.service.registerRoom(connection, socket);
 * ```
 * 3. Sends messages (public or private), usage example:
 * ```ts
 * this.repository.sendMessage(message);
 * this.repository.sendPrivateMessage(message);
 * ```
 *
 * * You'll need to inject `ChatRepository` for that
 */
@Injectable()
export class ChatService implements OnModuleInit {
  private readonly log: Logger = new Logger(ChatService.name);
  private readonly forbiddenNicknames = new Set(['system']);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private repository: ChatRepository,
  ) {}

  // Creates main room on startup
  async onModuleInit() {
    await this.cacheManager.set('room:main', []);
  }

  /**
   *
   * @param connection holds the connection information
   * @param socket
   * register client to a room and subscribe to all channels as describe on the class doc
   */
  async registerRoom(connection: Connection, socket: Socket, server: Server) {
    const roomClients =
      (await this.cacheManager.get<Connection[]>(connection.room)) ?? [];
    const createRoom =
      roomClients.length === 0 && connection.room !== 'room:main';

    await this.removeUserFromRoom(connection.clientId, server);
    await this.validateNickname(connection.nickname);
    await this.cacheManager.set(`nickname:${connection.nickname}`, connection);

    const messageSub = this.repository
      .getMessagesStream(connection)
      .subscribe((message) => {
        socket.send(message);
      });

    const roomSub = this.repository
      .getRoomEventsStream(connection)
      .subscribe((room) => {
        socket.emit(`room`, room);
      });

    const privateMessageSub = this.repository
      .getPrivateMessageStream(connection)
      .subscribe((message) => {
        socket.emit('private-message', { ...message, room: 'private' });
      });
    roomClients.push(connection);

    await this.cacheManager.set(connection.room, roomClients);

    connection.subscriptions = [messageSub, roomSub, privateMessageSub];
    await this.addUserToRoom(connection);

    if (createRoom) {
      this.log.debug(`CREATE ROOM [${connection.room}]`);
      await this.notifyRoomChange(server);
    }
    this.log.verbose(
      `ADD USER [${connection.nickname}] to room [${connection.room}]`,
    );
  }

  /**
   *
   * @param client if client is given is sends the event for the specific client
   */
  async notifyRoomChange(server: Server, client?: Socket) {
    const rooms = (await this.getRooms()).reverse();
    if (client) {
      client.emit('room-list', { rooms });
      return;
    }

    server.emit('room-list', { rooms });
  }

  private async addUserToRoom(connection: Connection) {
    await this.cacheManager.set(
      `connection:${connection.clientId}`,
      connection,
    );
    await this.notifyRoomClients(connection.room, connection.clientId);
    // Send welcome message
    this.repository.sendMessage({
      clientId: 'system',
      message: `Welcome '${connection.nickname}' to '${connection.room}'!`,
      nickname: 'system',
      room: connection.room,
      timestamp: new Date(),
    });
  }

  async removeUserFromRoom(clientId: string, server: Server) {
    const connection = await this.cacheManager.get<Connection>(
      `connection:${clientId}`,
    );
    // In case of none connections
    if (!connection) {
      return;
    }
    this.log.verbose(
      `REMOVE USER [${connection.nickname}] from room [${connection.room}]`,
    );
    connection.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    await this.cacheManager.del(`connection:${clientId}`);
    await this.cacheManager.del(`nickname:${connection.nickname}`);

    const roomConnections = await this.cacheManager.get<Connection[]>(
      connection.room,
    );
    if (!roomConnections) {
      return;
    }
    const i = roomConnections.findIndex(
      (connection) => connection.clientId === clientId,
    );
    roomConnections.splice(i, 1);
    if (roomConnections.length < 1 && connection.room !== 'room:main') {
      this.cacheManager.del(connection.room);
      await this.notifyRoomChange(server);
      this.log.debug(`DELETE ROOM [${connection.room}]`);
      return;
    }

    // unsubscribe from all channels
    await this.notifyRoomClients(connection.room, clientId);
    // Send left message
    this.repository.sendMessage({
      clientId: 'system',
      message: `'${connection.nickname}' left '${connection.room}!'`,
      nickname: 'system',
      room: connection.room,
      timestamp: new Date(),
    });
  }

  private async getRooms() {
    return (await this.cacheManager.store.keys('room:*')).filter((room) =>
      room.match('room:*'),
    );
  }

  async notifyRoomClients(room: string, clientId: string) {
    const connections = await this.cacheManager.get<Connection[]>(room);
    this.repository.sendRoomEvent({
      clientId,
      room,
      connections,
      timestamp: new Date(),
    });
  }

  async sendPrivateMessage(message: PrivateMessage) {
    const destination = await this.cacheManager.get(
      `connection:${message.destination}`,
    );

    if (destination) {
      return this.repository.sendPrivateMessage(message);
    }

    throw new NotFoundException(
      `Destination ${message.destination} was not found`,
    );
  }

  async validateNickname(nickname: string) {
    const nicknameExist = await this.cacheManager.get(`nickname:${nickname}`);

    if (nicknameExist) {
      throw new BadRequestException([`Nickname ${nickname} already exists`]);
    }

    if (this.forbiddenNicknames.has(nickname)) {
      throw new ForbiddenException([`Nickname ${nickname} is not allowed`]);
    }
  }
}
