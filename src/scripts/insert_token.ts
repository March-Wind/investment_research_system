import { AppModule } from '@/app.module';
import { AutoTokenService } from '@/modules/openai/autoToken.service';
import { OpenAIModule } from '@/modules/openai/module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const autoTokensModule = app.select(OpenAIModule);
  const autoToken = autoTokensModule.get(AutoTokenService);
  // await autoToken.insertCopilotTokenMany();
  // await autoToken.insertTransferTokenMany();
  // console.log(await autoToken.findAll());
  // @ts-ignore
  await autoToken.updateCopilotTokenState({ key: 'transfer2', tokenType: 'transfer', kind: 'TransferToken' });
}
bootstrap();
