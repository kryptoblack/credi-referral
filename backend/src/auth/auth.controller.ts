import { Controller, Get, HttpStatus, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { IResponse } from 'src/common/common.interface';
import { AuthService } from 'src/auth/auth.service';
import { IAuthenticatedRequest } from 'src/common/common.interface';
import {
  routes,
  DEFAULT_GENERATE_API_RESPONSE_KWARGS,
} from 'src/common/common.constant';
import { generateApiResponse } from 'src/common/common.utils';
import { IAccessToken } from './auth.interface';

@ApiBearerAuth()
@ApiTags('Auth')
@Controller(routes.auth.BASE_URL)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get(routes.auth.REFRESH)
  @ApiResponse(
    generateApiResponse({
      status: HttpStatus.OK,
      description: 'Refresh token',
      success: false,
      message: 'Token refreshed successfully',
      dataSchema: {
        type: 'object',
        properties: { accessToken: { type: 'string' } },
      },
      data: {
        accessToken: '<ACCESS_TOKEN>',
      } as IAccessToken,
    }),
  )
  @ApiResponse(
    generateApiResponse({
      ...DEFAULT_GENERATE_API_RESPONSE_KWARGS,
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized',
      message: 'Unauthorized',
    }),
  )
  @ApiResponse(
    generateApiResponse({
      ...DEFAULT_GENERATE_API_RESPONSE_KWARGS,
    }),
  )
  async refresh(
    @Request() req: IAuthenticatedRequest,
  ): Promise<IResponse & { data: IAccessToken }> {
    /**
     * This route is protected by the AuthGuard. If the request makes it this
     * far, we can assume that the user is authenticated and we can return a
     * new access token.
     *
     * @param req The request object.
     * @returns A response object containing the new access token.
     * @throws {UnauthorizedException} If the user is not authenticated.
     * @throws {InternalServerErrorException}
     */

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: await this.authService.refresh(req.user),
    };
  }
}
