import { AutoTokenModule } from '@/schema/settings/auto_token';
import { Module } from '@nestjs/common';
import { AutoTokenService } from './autoToken.service';
import { ChatService } from './chat.service';
import { AutoTokenController } from './controller';

@Module({
  imports: [AutoTokenModule],
  controllers: [AutoTokenController],
  providers: [AutoTokenService, ChatService],
  exports: [ChatService]
})
export class OpenAIModule {}
