import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { Repository } from 'typeorm';
import { randomBytes, scryptSync } from 'crypto';

import { LoginDto } from 'src/auth/dto/login.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { User } from 'src/users/users.entity';
import {
  IAccessToken,
  IAuthenticatedUser,
  ITokens,
} from 'src/auth/auth.interface';
import { TokenType } from './auth.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: RegisterDto): Promise<User> {
    /**
     * This method is responsible for registering a new user.
     *
     * @param body The request body.
     * @returns The newly created user.
     */

    const salt: string = randomBytes(16).toString('hex');
    const hPass: string = scryptSync(body.password, salt, 32).toString('hex');
    const user = this.userRepository.create({
      salt,
      username: body.username,
      password: hPass,
      fullName: body.fullName,
    });
    return await this.userRepository.save(user);
  }

  async login(body: LoginDto): Promise<ITokens> {
    /**
     * This method is responsible for logging in a user.
     *
     * @param body The request body.
     * @returns An object containing the access and refresh tokens.
     *
     * @throws {UnauthorizedException} If the login details are invalid.
     */

    const message = 'Invalid login details';
    try {
      const user = await this.userRepository.findOne({
        where: { username: body.username },
      });

      const hPass = scryptSync(body.password, user.salt, 32).toString('hex');
      if (hPass !== user.password) {
        throw new UnauthorizedException(message);
      }

      return {
        accessToken: this.jwtService.sign({
          sub: user.id,
          type: TokenType.access,
        }),
        refreshToken: this.jwtService.sign(
          { sub: user.id, type: TokenType.refresh },
          { expiresIn: '7d' },
        ),
      };
    } catch (error) {
      throw new UnauthorizedException(message);
    }
  }

  async refresh(user: IAuthenticatedUser): Promise<IAccessToken> {
    /**
     * This method is responsible for refreshing a user's access token.
     * It takes in a user object and returns a new access token.
     *
     * @param user The user object.
     * @returns The access token.
     */

    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
        type: TokenType.access,
      }),
    };
  }
}
