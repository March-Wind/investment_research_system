import { Module } from '@nestjs/common';
import { ProxyIpController } from './proxy_ip.controller';
import { ProxyIpService } from './proxy_ip.service';
import { proxyIpModule } from '@/schema/settings/proxy_ip';
@Module({
  imports: [proxyIpModule],
  controllers: [ProxyIpController],
  providers: [ProxyIpService],
})
export class ProxyIpModule {}
