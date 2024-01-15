import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReferralController } from 'src/referral/referral.controller';
import { ReferralService } from 'src/referral/referral.service';
import { Referral } from 'src/referral/referral.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Referral]), UsersModule],
  controllers: [ReferralController],
  providers: [TypeOrmModule, ReferralService],
})
export class ReferralModule {}
