import { Module } from '@nestjs/common';
import { TaskExecutorService } from './task-executor.service';
import { OpenAIModule } from '../openai/module';
import { ExpertTastsService } from './expert-tasts/expert-tasts.service';

@Module({
  imports: [OpenAIModule],
  providers: [TaskExecutorService, ExpertTastsService],
  exports: [TaskExecutorService],
})
export class TaskExecutorModule {}
