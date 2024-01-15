import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExpireReferralDto {
  @ApiProperty({
    description: 'The referral code.',
    example: '1234567',
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
