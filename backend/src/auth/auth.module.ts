import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get('APP.secret'),
        signOptions: { expiresIn: '60d' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [
    AuthService,

    // Even if the AuthGuard is declared as a provider in the AuthModule, it is
    // global-scoped and is applied to all modules. You can read more about it
    // on https://docs.nestjs.com/guards
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
