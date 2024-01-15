import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyReferralDto {
  @ApiProperty({
    description: 'The referral code.',
    example: '1234567',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'The user ID.',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  refereeUserId: number;
}
