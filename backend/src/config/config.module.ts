import { Module } from '@nestjs/common';
import { ConfigModule as CM } from '@nestjs/config';

import { configurations } from 'src/config/config';
import { validateConfig } from 'src/config/config-validation';

@Module({
  imports: [
    CM.forRoot({
      envFilePath: [
        '.env.production.local',
        '.env.production',
        '.env.staging.local',
        '.env.staging',
        '.env.development.local',
        '.env.development',
        '.env.testing.local',
        '.env.testing',
        '.env.local',
        '.env',
      ],
      load: [...configurations],
      isGlobal: true,
      validate: validateConfig,
    }),
  ],
})
export class ConfigModule {}
