import { Test, TestingModule } from '@nestjs/testing';
import { ProxyIpController } from './proxy_ip.controller';

describe('ProxyIpController', () => {
  let controller: ProxyIpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyIpController],
    }).compile();

    controller = module.get<ProxyIpController>(ProxyIpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
