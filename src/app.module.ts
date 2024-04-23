import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import globalModules from '@/utils/globalModules';
import { OpenAIModule } from '@/modules/openai/module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProxyIpModule } from './modules/proxy_ip/proxy_ip.module';
import { ChipIndustryModule } from './modules/chip_industry/chip_industry.module';
import { TaskExecutorModule } from './modules/task-executor/task-executor.module';

@Module({
  imports: [...globalModules, OpenAIModule, AuthModule, UsersModule, ProxyIpModule, ChipIndustryModule, TaskExecutorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
