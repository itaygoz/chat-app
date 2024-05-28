import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket } from 'socket.io-client';

@Catch(HttpException)
export class WsExceptionsFilter extends BaseWsExceptionFilter {
  private readonly log = new Logger();
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToWs();
    const client = context.getClient() as Socket;

    this.log.error(
      `${exception.message} for client [${client.id}]`,
      context.getPattern(),
    );
    client.emit('error', {
      status: exception.getStatus(),
      error: exception.getResponse(),
      path: context.getPattern(),
    });
  }
}
