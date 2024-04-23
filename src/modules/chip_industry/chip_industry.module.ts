import { Module } from '@nestjs/common';
import { ChipIndustryController } from './chip_industry.controller';
import { ChipIndustryService } from './chip_industry.service';
import { OpenAIModule } from '../openai/module';
import { TaskExecutorModule } from '../task-executor/task-executor.module';

@Module({
  imports: [OpenAIModule, TaskExecutorModule],
  controllers: [ChipIndustryController],
  providers: [ChipIndustryService],
})
export class ChipIndustryModule {}
