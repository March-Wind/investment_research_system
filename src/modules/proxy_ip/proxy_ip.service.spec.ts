import { Test, TestingModule } from '@nestjs/testing';
import { ProxyIpService } from './proxy_ip.service';

describe('ProxyIpService', () => {
  let service: ProxyIpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProxyIpService],
    }).compile();

    service = module.get<ProxyIpService>(ProxyIpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
