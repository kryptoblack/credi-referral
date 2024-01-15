import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { AppController } from 'src/app.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from 'src/config/config.module';
import { Environment } from 'src/config/config.enum';
import { ErrorFilter } from 'src/common/filter/error.filter';
import { ReferralModule } from 'src/referral/referral.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB.host'),
        port: configService.get('DB.port'),
        username: configService.get('DB.username'),
        password: configService.get('DB.password'),
        database: configService.get('DB.name'),

        // Do not use synchronize in production - otherwise you may lose production data.
        synchronize: configService.get('APP.env') !== Environment.Production,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    // Application modules
    UsersModule,
    AuthModule,
    ConfigModule,
    ReferralModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
  ],
})
export class AppModule {}
