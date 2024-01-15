import {
  Controller,
  Post,
  Request,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { IAuthenticatedRequest, IResponse } from 'src/common/common.interface';
import { ReferralService } from 'src/referral/referral.service';
import {
  routes,
  DEFAULT_GENERATE_API_RESPONSE_KWARGS,
} from 'src/common/common.constant';
import {
  generateApiResponse,
  generateRandomHex,
} from 'src/common/common.utils';
import { ExpireReferralDto } from './dto/expire-referral.dto';
import { VerifyReferralDto } from './dto/verify-referral.dto';
import { UsersService } from 'src/users/users.service';
import { ErrorCode } from 'src/common/common.enum';

@ApiTags('Referral')
@ApiBearerAuth()
@Controller(routes.referral.BASE_URL)
export class ReferralController {
  constructor(
    private readonly referralService: ReferralService,
    private readonly userService: UsersService,
  ) {}

  @HttpCode(200)
  @Post(routes.referral.GENERATE)
  @ApiResponse(
    generateApiResponse({
      status: HttpStatus.OK,
      description: 'Referral link generated successfully',
      success: true,
      message: 'Referral link generated successfully',
      dataSchema: { type: 'string' },
      data: '<REFERRAL_LINK>',
    }),
  )
  @ApiResponse(
    generateApiResponse({
      ...DEFAULT_GENERATE_API_RESPONSE_KWARGS,
      status: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
      description: 'Unauthorized',
    }),
  )
  @ApiResponse(generateApiResponse({ ...DEFAULT_GENERATE_API_RESPONSE_KWARGS }))
  async generate(@Request() req: IAuthenticatedRequest): Promise<IResponse> {
    /**
     * This controller method is responsible for generating a referral link for the user.
     *
     * @param req The request object.
     * @returns The response object.
     */

    const { user } = req;
    const code = generateRandomHex(7);
    const link = this.referralService.generateReferralLink(user.id, code);

    // Store the link in the database.
    await this.referralService.createReferral(user.id, code);

    return {
      success: true,
      message: 'Referral link generated successfully',
      data: link,
    };
  }

  @Post(routes.referral.EXPIRE)
  @HttpCode(HttpStatus.OK)
  @ApiResponse(
    generateApiResponse({
      status: HttpStatus.OK,
      description: 'Referral link expired successfully',
      success: true,
      message: 'Referral link expired successfully',
      dataSchema: {},
      data: null,
    }),
  )
  @ApiResponse(
    generateApiResponse({
      ...DEFAULT_GENERATE_API_RESPONSE_KWARGS,
      description: 'Not Found',
      message: 'Referral link does not exist',
      status: HttpStatus.NOT_FOUND,
      errorCode: ErrorCode.REFERRAL_NOT_FOUND,
    }),
  )
  @ApiResponse(
    generateApiResponse({
      ...DEFAULT_GENERATE_API_RESPONSE_KWARGS,
      message: 'Unauthorized',
      description: 'Unauthorized',
      status: HttpStatus.UNAUTHORIZED,
    }),
  )
  @ApiResponse(generateApiResponse({ ...DEFAULT_GENERATE_API_RESPONSE_KWARGS }))
  async expire(
    @Request() req: IAuthenticatedRequest,
    @Body() body: ExpireReferralDto,
  ): Promise<IResponse> {
    /**
     * This controller method is responsible for expiring a referral link.
     *
     * @param req The request object.
     * @param body The request body.
     * @returns The response object.
     */

    const { user } = req;
    const { code } = body;
    const referral = await this.referralService.getActiveReferral(
      user.id,
      code,
      { id: true },
    );

    if (!referral) {
      throw new NotFoundException({
        success: false,
        message: 'Referral link does not exist',
        data: null,
        errorCode: ErrorCode.REFERRAL_NOT_FOUND,
      });
    }

    await this.referralService.expireReferralByUserId(referral.id);

    return {
      success: true,
      message: 'Referral link expired successfully',
      data: null,
    };
  }

  @Post(routes.referral.VERIFY)
  @HttpCode(HttpStatus.OK)
  @ApiResponse(
    generateApiResponse({
      status: HttpStatus.OK,
      description: 'Referral link verified successfully',
      success: true,
      message: 'Referral link verified successfully',
      dataSchema: {},
      data: null,
    }),
  )
  @ApiResponse(
    generateApiResponse({
      ...DEFAULT_GENERATE_API_RESPONSE_KWARGS,
      status: HttpStatus.NOT_FOUND,
      description: 'Referral link does not exist',
      message: 'Referral link does not exist',
      success: false,
      errorCode: ErrorCode.REFERRAL_NOT_FOUND,
    }),
  )
  @ApiResponse(
    generateApiResponse({
      ...DEFAULT_GENERATE_API_RESPONSE_KWARGS,
      status: HttpStatus.BAD_REQUEST,
      description: 'Cannot verify your own referral link',
      message: 'You cannot refer yourself',
      success: false,
      errorCode: ErrorCode.CANNOT_REFER_SELF,
    }),
  )
  @ApiResponse(
    generateApiResponse({
      ...DEFAULT_GENERATE_API_RESPONSE_KWARGS,
      status: HttpStatus.BAD_REQUEST,
      description: 'You have already been referred',
      message: 'You have already been referred',
      success: false,
      errorCode: ErrorCode.ALREADY_REFERRED,
    }),
  )
  @ApiResponse(
    generateApiResponse({
      ...DEFAULT_GENERATE_API_RESPONSE_KWARGS,
      description: 'Unauthorized',
      message: 'Unauthorized',
      status: HttpStatus.UNAUTHORIZED,
    }),
  )
  @ApiResponse(generateApiResponse({ ...DEFAULT_GENERATE_API_RESPONSE_KWARGS }))
  async verify(
    @Request() req: IAuthenticatedRequest,
    @Body() body: VerifyReferralDto,
  ): Promise<IResponse & { data: null }> {
    /**
     * This controller method is responsible for verifying a referral link.
     *
     * @param req The request object.
     * @param body The request body.
     * @returns The response object.
     */

    if (req.user.id === body.refereeUserId) {
      throw new BadRequestException({
        success: false,
        message: 'You cannot refer yourself',
        data: null,
        errorCode: ErrorCode.CANNOT_REFER_SELF,
      });
    }

    const user = await this.userService.findOneById(req.user.id, {
      referral: true,
    });

    if (user.referral) {
      throw new BadRequestException({
        success: false,
        message: 'You have already been referred',
        data: null,
        errorCode: ErrorCode.ALREADY_REFERRED,
      });
    }

    const referral = await this.referralService.verifyReferral(
      req.user.id,
      body.refereeUserId,
      body.code,
    );

    if (!referral) {
      throw new NotFoundException({
        success: false,
        message: 'Referral link does not exist',
        data: null,
        errorCode: ErrorCode.REFERRAL_NOT_FOUND,
      });
    }

    return {
      success: true,
      message: 'Referral link verified successfully',
      data: null,
    };
  }
}
