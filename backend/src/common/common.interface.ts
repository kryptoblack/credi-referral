import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';

import { IAuthenticatedUser } from 'src/auth/auth.interface';

export interface IResponse {
  success: boolean;
  message: string;
  data: Array<any> | Record<string, any> | number | string | boolean | null;
  errorCode?: string;
  errors?: Array<string>;
}

export interface IAuthenticatedRequest extends Request {
  user: IAuthenticatedUser;
}

export interface IGererateSwaggerApi extends IResponse {
  status: HttpStatus;
  description: string;
  dataSchema: any;
}
