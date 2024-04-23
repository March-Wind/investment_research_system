import { Controller } from '@nestjs/common';
import { AutoTokenService } from './autoToken.service';

@Controller()
export class AutoTokenController {
  constructor(private readonly autoTokenService: AutoTokenService) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }
}
