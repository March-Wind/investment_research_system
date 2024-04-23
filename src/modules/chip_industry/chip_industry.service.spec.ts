import { Test, TestingModule } from '@nestjs/testing';
import { ChipIndustryService } from './chip_industry.service';

describe('ChipIndustryService', () => {
  let service: ChipIndustryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChipIndustryService],
    }).compile();

    service = module.get<ChipIndustryService>(ChipIndustryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
