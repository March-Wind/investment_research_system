import { Prop, Schema, SchemaFactory, MongooseModule } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BaseDocument = HydratedDocument<Base>;
export class Base {
  @Prop()
  key: string;

  @Prop()
  token: string;

  @Prop({ required: true, type: String })
  keyState: 'occupied' | 'idle' | 'discard' | 'error';

  @Prop({ required: true })
  tokenType: 'copilot' | 'transfer' | 'openai';

  @Prop()
  rateLimiting?: Date;

  @Prop()
  errorInfo?: string;
}

@Schema()
export class CopilotToken extends Base {
  @Prop()
  requestTokenUrl: string;

  @Prop({ type: Object })
  requestTokenHeaders: Record<string, string>;

  @Prop()
  effectiveStartTime: string;

  @Prop()
  effectiveEndTime: string;

  @Prop()
  tokenExpiredTime: Date;

  @Prop()
  exChangeTokenRestTime: Date;

  @Prop()
  origin: string;

  @Prop({ type: Object })
  headers: Record<string, string>;
}

export const CopilotTokenSchema = SchemaFactory.createForClass(CopilotToken);

@Schema()
export class TransferToken extends Base {
  @Prop()
  origin: string;

  @Prop({ type: Object })
  headers: Record<string, string>;

  @Prop({ default: 0 })
  times: number;
}
export const TransferTokenSchema = SchemaFactory.createForClass(TransferToken);

// 以后拓展
@Schema()
export class OpenAiToken extends Base {}
export const collectionName = 'auto_tokens';

@Schema({
  discriminatorKey: 'kind',
  collection: collectionName,
})
export class AutoToken extends Base {
  @Prop({
    type: String,
    required: true,
    enum: [CopilotToken.name, TransferToken.name, OpenAiToken.name],
  })
  kind: string;
}

export const AutoTokenSchema = SchemaFactory.createForClass(AutoToken);

export const dbName = 'settings';
// auto-token的模型模块
export const AutoTokenModule = MongooseModule.forFeature(
  [
    {
      name: collectionName,
      schema: AutoTokenSchema,
      discriminators: [
        { name: CopilotToken.name, schema: CopilotTokenSchema },
        { name: TransferToken.name, schema: TransferTokenSchema },
      ],
    },
  ],
  dbName,
);
