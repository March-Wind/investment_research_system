import { Prop, Schema, SchemaFactory, MongooseModule } from '@nestjs/mongoose';
// 最大5000个，7天后过期，就删除了
@Schema({ capped: { max: 5000 }, expireAfterSeconds: 604800 })
export class ProxyIp {
  @Prop({ required: true, unique: true, index: true })
  ip: string;
  @Prop()
  port: string;
  @Prop()
  type: 'http' | 'https' | 'http|https' | 'socks5';
  @Prop()
  timeout: number;
  @Prop()
  country: 'United States' | string;
  @Prop()
  city: string;
  @Prop()
  usedDays: number;
}
export const ProxyIpSchema = SchemaFactory.createForClass(ProxyIp);
export const collectionName = 'proxy_ip';
export const dbName = 'settings';
// auto-token的模型模块
export const proxyIpModule = MongooseModule.forFeature(
  [
    {
      name: collectionName,
      schema: ProxyIpSchema,
    },
  ],
  dbName,
);
