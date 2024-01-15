import { registerAs } from '@nestjs/config';
import { Environment, ConfigKey } from './config.enum';

const APPConfig = registerAs(ConfigKey.App, () => ({
  env:
    Environment[process.env.NODE_ENV as keyof typeof Environment] ||
    'development',
  port: Number(process.env.APP_PORT),
  appName: process.env.APP_NAME,
  secret: process.env.APP_SECRET,
  domain: process.env.APP_DOMAIN,
  protocol: process.env.APP_PROTOCOL === 'https' ? 'https' : 'http',
}));

const DBConfig = registerAs(ConfigKey.Db, () => ({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  name: process.env.DATABASE_NAME,
}));

export const configurations = [APPConfig, DBConfig];
