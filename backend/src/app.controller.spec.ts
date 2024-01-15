import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import * as mocks from 'node-mocks-http';
import { MockRequest } from 'node-mocks-http';
import { Request } from 'express';

import { AppController } from './app.controller';
import { AuthService } from './auth/auth.service';
import { LoginDto } from './auth/dto/login.dto';
import { ErrorCode } from './common/common.enum';
import { RegisterDto } from './auth/dto/register.dto';
import { IPublicUser } from './users/users.interface';
import { UsersService } from './users/users.service';
import { IAuthenticatedUser } from './auth/auth.interface';
import { IAuthenticatedRequest } from './common/common.interface';

const moduleMocker = new ModuleMocker(global);

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return {
            getBalance: jest.fn().mockResolvedValue(5030),
            checkIfUsernameExists: jest
              .fn()
              .mockImplementation(
                async (username: string): Promise<boolean> => {
                  return username === 'springroll' ? true : false;
                },
              ),
          };
        } else if (token === AuthService) {
          return {
            register: jest
              .fn()
              .mockImplementation(
                async (body: RegisterDto): Promise<IPublicUser> => {
                  if (
                    body.username === 'kryptoblack' &&
                    body.password === 'test123'
                  ) {
                    return {
                      id: 1,
                      username: 'kryptoblack',
                      fullName: 'Krypto Black',
                      isAdmin: false,
                      balance: 0,
                    };
                  } else {
                    throw new BadRequestException({
                      success: false,
                      message: 'Username already exists',
                      data: null,
                      errorCode: ErrorCode.USERNAME_ALREADY_EXISTS,
                    });
                  }
                },
              ),
            login: jest.fn().mockImplementation(async (body: LoginDto) => {
              if (
                body.username === 'kryptoblack' &&
                body.password === 'test123'
              ) {
                return {
                  accessToken: 'string',
                  refreshToken: 'string',
                };
              } else {
                throw new UnauthorizedException({
                  success: false,
                  message: 'Invalid login details',
                  data: null,
                  errorCode: ErrorCode.UNAUTHORIZED,
                });
              }
            }),
          };
        }

        // Generic mock
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .overrideGuard(AuthService)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          if (!req?.headers?.authorization) return false;
          req.user = { user: { id: 0 } };
          return true;
        },
      })
      .compile();

    appController = moduleRef.get<AppController>(AppController);
  });

  describe('login', () => {
    it('should return an object containing the access and refresh tokens', async () => {
      const credentials = { username: 'kryptoblack', password: 'test123' };
      expect(await appController.login(credentials)).toEqual({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
      });
    });

    it('should throw an UnauthorizedException if the login details are invalid', async () => {
      const credentials = { username: 'kryptoblack', password: 'test' };

      try {
        await appController.login(credentials);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.response).toEqual({
          success: false,
          message: 'Invalid login details',
          data: null,
          errorCode: ErrorCode.UNAUTHORIZED,
        });
      }
    });
  });

  describe('register', () => {
    it('should return an object of type PublicUser', async () => {
      const credentials = {
        username: 'kryptoblack',
        password: 'test123',
        fullName: 'Krypto Black',
      };
      expect(await appController.register(credentials)).toEqual({
        success: true,
        message: 'User created successfully',
        data: {
          id: expect.any(Number),
          username: expect.any(String),
          fullName: expect.any(String),
          isAdmin: expect.any(Boolean),
          balance: expect.any(Number),
        },
      });
    });

    it('should throw an BadRequestException if username already exists', async () => {
      try {
        await appController.register({
          username: 'springroll',
          password: 'test123',
          fullName: 'Spring Roll',
        });
        fail('Expected BadRequestException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toEqual({
          success: false,
          message: 'Username already exists',
          data: null,
          errorCode: ErrorCode.USERNAME_ALREADY_EXISTS,
        });
      }
    });
  });

  describe('balance', () => {
    it('should return the user balance', async () => {
      const credentials = { username: 'kryptoblack', password: 'test123' };
      const req = mocks.createRequest({
        headers: {
          authorization:
            'Bearer ' +
            (await appController.login(credentials)).data.accessToken,
        },
      });
      req.res = mocks.createResponse();
      req.user = { id: 0 };

      expect(
        await appController.getBalance(
          req as MockRequest<
            Request & { user: IAuthenticatedUser }
          > as IAuthenticatedRequest,
        ),
      ).toEqual({
        success: true,
        message: 'Balance retrieved successfully',
        data: 5030,
      });
    });
  });
});
