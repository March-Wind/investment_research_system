import { AppModule } from '@/app.module';
import { ChipIndustryModule } from '@/modules/chip_industry/chip_industry.module';
import { ChipIndustryService } from '@/modules/chip_industry/chip_industry.service';
import { NestFactory } from '@nestjs/core';
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const chipIndustryModule = app.select(ChipIndustryModule);
  const chipIndustryService = chipIndustryModule.get(ChipIndustryService);
  await chipIndustryService.generatorChipManufacturingProcessFlowchart();
}
bootstrap();
