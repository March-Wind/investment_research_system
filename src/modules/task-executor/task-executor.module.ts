import { Module } from '@nestjs/common';
import { TaskExecutorService } from './task-executor.service';
import { OpenAIModule } from '../openai/module';

@Module({
  imports: [OpenAIModule],
  providers: [TaskExecutorService],
  exports: [TaskExecutorService],
})
export class TaskExecutorModule {}
