import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from './common.enum';

export const API_PREFIX = '/api';
export const routes = {
  root: {
    BASE_URL: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    BALANCE: '/balance',
  },
  users: {
    BASE_URL: '/users',
  },
  auth: {
    BASE_URL: '/auth',
    REFRESH: '/auth/refresh',
  },
  referral: {
    BASE_URL: '/referral',
    GENERATE: '/referral/generate',
    EXPIRE: '/referral/expire',
    VERIFY: '/referral/verify',
  },
};

export const DEFAULT_GENERATE_API_RESPONSE_KWARGS = {
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal Server Error',
  success: false,
  data: null,
  dataSchema: {},
  message: 'Internal server error',
  errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
};
