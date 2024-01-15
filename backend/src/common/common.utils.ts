import { ApiResponseOptions } from '@nestjs/swagger';
import { IGererateSwaggerApi } from './common.interface';
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from './common.enum';

export const generateRandomHex = (size: number): string => {
  /**
   * Generate random hex string. This function can product 16^size unique hex
   * string.
   *
   * @param size - Size of the hex string.
   * @returns Random hex string.
   */

  if (size < 1 || !Number.isInteger(size)) {
    throw new Error('Size must be a positive integer');
  }

  const randomDecimal = Math.floor(Math.random() * Math.pow(16, size));
  const randomHex = randomDecimal.toString(16).padStart(size, '0');
  return randomHex;
};

export const generateApiResponse = ({
  status,
  description,
  success,
  dataSchema,
  data,
  message,
  errors,
  errorCode,
}: IGererateSwaggerApi): ApiResponseOptions => {
  /**
   * This method is responsible for generating the response object for Swagger.
   * The default response object is for Internal Server Error.
   *
   * @param status The HTTP status code.
   * @param description The description of the response.
   * @param success The success status of the response.
   * @param dataSchema The schema of the data.
   * @param data The data to be returned.
   * @param message The message to be returned.
   * @param errors The errors to be returned.
   * @param errorCode The error code to be returned.
   * @returns The response object.
   */

  if (status === HttpStatus.UNAUTHORIZED) {
    description = 'Unauthorized';
    success = false;
    message = message;
    dataSchema = {};
    data = null;
    errorCode = ErrorCode.UNAUTHORIZED;
  }

  const schema = {
    properties: {
      success: {
        type: 'boolean',
        example: success,
      },
      message: {
        type: 'string',
        example: message,
      },
      data: {
        ...dataSchema,
        example: data,
      },
    },
  };

  if (errorCode) {
    schema.properties['errorCode'] = {
      type: 'string',
      example: errorCode,
    };
  }

  if (errors) {
    schema.properties['errors'] = {
      type: 'array',
      items: {
        type: 'string',
      },
      example: errors,
    };
  }

  return {
    status: status,
    description: description,
    schema: schema,
  };
};
