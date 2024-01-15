import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from 'src/auth/auth.service';
import { IAuthenticatedRequest, IResponse } from 'src/common/common.interface';
import { LoginDto } from 'src/auth/dto/login.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { ITokens } from 'src/auth/auth.interface';
import { Public } from 'src/auth/auth.constant';
import { UsersService } from 'src/users/users.service';
import {
  routes,
  DEFAULT_GENERATE_API_RESPONSE_KWARGS,
} from 'src/common/common.constant';
import { IPublicUser } from './users/users.interface';
import { generateApiResponse } from './common/common.utils';
import { ErrorCode } from './common/common.enum';

@ApiTags('Root')
@Controller(routes.root.BASE_URL)
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Public()
  @Post(routes.root.LOGIN)
  @HttpCode(HttpStatus.OK)
  @ApiResponse(
    generateApiResponse({
      status: HttpStatus.OK,
      description: 'Login successful',
      success: true,
      message: 'Login successful',
      dataSchema: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      data: {
        accessToken: '<ACCESS_TOKEN>',
        refreshToken: '<REFRESH_TOKEN>',
      },
    }),
  )
  @ApiResponse(
    generateApiResponse({
      ...DEFAULT_GENERATE_API_RESPONSE_KWARGS,
      status: HttpStatus.UNAUTHORIZED,
      message: 'Invalid login details',
    }),
  )
  @ApiResponse(generateApiResponse({ ...DEFAULT_GENERATE_API_RESPONSE_KWARGS }))
  async login(@Body() body: LoginDto): Promise<IResponse & { data: ITokens }> {
    /**
     * This method is responsible for logging in a user.
     *
     * @param body The login details.
     * @returns The response object.
     * @throws {UnauthorizedException} If the login details are invalid.
     * @throws {InternalServerErrorException}
     */

    const tokens = await this.authService.login(body);
    return {
      success: true,
      message: 'Login successful',
      data: tokens,
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post(routes.root.REGISTER)
  @ApiResponse(
    generateApiResponse({
      status: HttpStatus.OK,
      description: 'Register a new user',
      success: true,
      message: 'User created successfully',
      dataSchema: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          username: { type: 'string' },
          fullName: { type: 'string' },
          isAdmin: { type: 'boolean' },
          balance: { type: 'number' },
        },
      },
      data: {
        id: 1,
        username: 'username',
        fullName: 'Full Name',
        isAdmin: false,
        balance: 0,
      },
    }),
  )
  @ApiResponse(
    generateApiResponse({
      ...DEFAULT_GENERATE_API_RESPONSE_KWARGS,
      status: HttpStatus.BAD_REQUEST,
      message: 'Username already exists',
      description: 'Bad Request',
      errorCode: ErrorCode.USERNAME_ALREADY_EXISTS,
    }),
  )
  @ApiResponse(generateApiResponse({ ...DEFAULT_GENERATE_API_RESPONSE_KWARGS }))
  async register(
    @Body() body: RegisterDto,
  ): Promise<IResponse & { data: IPublicUser }> {
    /**
     * This method is responsible for registering a new user.
     *
     * @param body The registration details.
     * @returns The response object.
     * @throws {BadRequestException} If the username is already taken.
     * @throws {InternalServerErrorException}
     */

    if (await this.userService.checkIfUsernameExists(body.username)) {
      throw new BadRequestException({
        success: false,
        message: 'Username already exists',
        data: null,
        errorCode: ErrorCode.USERNAME_ALREADY_EXISTS,
      });
    }

    const data = await this.authService.register(body);
    return {
      success: true,
      message: 'User created successfully',
      data: {
        id: data.id,
        username: data.username,
        fullName: data.fullName,
        isAdmin: data.isAdmin,
        balance: data.balance,
      },
    };
  }

  @Get(routes.root.BALANCE)
  @ApiBearerAuth()
  @ApiResponse(
    generateApiResponse({
      status: HttpStatus.OK,
      description: 'Balance retrieved successfully',
      success: true,
      message: 'Balance retrieved successfully',
      dataSchema: { type: 'number' },
      data: 5000,
    }),
  )
  @ApiResponse(
    generateApiResponse({
      ...DEFAULT_GENERATE_API_RESPONSE_KWARGS,
      status: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
    }),
  )
  @ApiResponse(generateApiResponse({ ...DEFAULT_GENERATE_API_RESPONSE_KWARGS }))
  async getBalance(@Request() req: IAuthenticatedRequest): Promise<IResponse> {
    const { user } = req;
    return {
      success: true,
      message: 'Balance retrieved successfully',
      data: await this.userService.getBalance(user.id),
    };
  }
}
