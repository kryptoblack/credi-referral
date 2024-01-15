import { Test, TestingModule } from '@nestjs/testing';
import { createRequest, createResponse, MockRequest } from 'node-mocks-http';
import { Request } from 'express';

import { AuthController } from './auth.controller';
import { IAccessToken, IAuthenticatedUser } from './auth.interface';
import { IAuthenticatedRequest } from 'src/common/common.interface';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService) {
          return {
            refresh: jest
              .fn()
              .mockImplementation(
                async (_: IAuthenticatedUser): Promise<IAccessToken> => {
                  return {
                    accessToken: 'new_access_token',
                  };
                },
              ),
          };
        }
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('refresh', () => {
    it('should return a new access token', () => {
      const req = createRequest();
      req.res = createResponse();
      req.user = {
        id: 0,
      } as IAuthenticatedUser;

      expect(
        controller.refresh(
          req as MockRequest<
            Request & { user: IAuthenticatedUser }
          > as IAuthenticatedRequest,
        ),
      ).resolves.toEqual({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: expect.any(String),
        },
      });
    });
  });
});
