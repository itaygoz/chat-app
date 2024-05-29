import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ChatRepository } from './chat.repository';

@Module({
  providers: [ChatGateway, ChatService, ChatRepository],
  imports: [
    CacheModule.register({
      max: 10000,
      ttl: 0,
    }),
  ],
})
export class ChatModule {}
