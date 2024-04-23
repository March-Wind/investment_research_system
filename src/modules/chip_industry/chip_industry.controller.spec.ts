import { Test, TestingModule } from '@nestjs/testing';
import { ChipIndustryController } from './chip_industry.controller';

describe('ChipIndustryController', () => {
  let controller: ChipIndustryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChipIndustryController],
    }).compile();

    controller = module.get<ChipIndustryController>(ChipIndustryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
