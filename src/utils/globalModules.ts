import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { sanitizeSlashes } from '@marchyang/lib-core';

import type { DynamicModule } from '@nestjs/common';
// env config;
const envConfig = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development',
});

// mongo
const createMongoDBModules = () => {
  const mongodb_uri = process.env.MONGODB_URI;
  const mongoDBUrlMap: Map<string, string> = new Map([
    ['users', sanitizeSlashes(`${mongodb_uri}/users`)],
    ['settings', sanitizeSlashes(`${mongodb_uri}/settings`)],
    ['transactions', sanitizeSlashes(`${mongodb_uri}/transactions`)],
  ]);
  const uris = mongoDBUrlMap.entries();
  const dbModules: DynamicModule[] = [];
  for (const [key, value] of uris) {
    const authSource = process.env.AUTH_SOURCE;
    dbModules.push(
      MongooseModule.forRoot(value, { authSource, connectionName: key }),
    );
  }
  return dbModules;
};

const mongoDBModules = createMongoDBModules();

const globalModules = [envConfig, ...mongoDBModules];
export default globalModules;
