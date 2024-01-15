import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Username', example: 'kryptoblack' })
  @IsNotEmpty()
  @MinLength(6)
  username: string;

  @ApiProperty({ description: 'Password', example: 'cakeer2sdk' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Full name', example: 'Pratik Thakare' })
  @IsNotEmpty()
  @MinLength(6)
  fullName: string;
}
