import { Test, TestingModule } from '@nestjs/testing';
import { TaskExecutorService } from './task-executor.service';

describe('TaskExecutorService', () => {
  let service: TaskExecutorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskExecutorService],
    }).compile();

    service = module.get<TaskExecutorService>(TaskExecutorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
