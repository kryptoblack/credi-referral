import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Response } from 'express';

import { IResponse } from 'src/common/common.interface';
import { ErrorCode } from 'src/common/common.enum';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let json: IResponse;

    if (exception instanceof HttpException) {
      switch (exception.getStatus()) {
        case HttpStatus.UNAUTHORIZED:
          json = {
            success: false,
            message: exception.message,
            data: null,
            errorCode: ErrorCode.UNAUTHORIZED,
          };

          return response.status(exception.getStatus()).json(json);
        default:
          response.status(exception.getStatus()).json(exception.getResponse());
      }
    }

    // If the exception is not an instance of HttpException, then it is an
    // internal server error. We'll log the error and return a generic
    // response to the client.
    json = {
      success: false,
      message: 'Internal server error',
      data: null,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(json);
  }
}
