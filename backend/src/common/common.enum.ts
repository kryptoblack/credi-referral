export enum ErrorCode {
  /** These error codes are in string format. This is done to avoid conflict
   * with the HTTP status codes. We are using error codes to identify the
   * specific error that occurred. */
  INTERNAL_SERVER_ERROR = 'internal-server-error',
  UNAUTHORIZED = 'unauthorized',
  BAD_REQUEST = 'bad-request',
  USERNAME_ALREADY_EXISTS = 'username-already-exists',
  REFERRAL_NOT_FOUND = 'referral-not-found',
  CANNOT_REFER_SELF = 'cannot-refer-self',
  ALREADY_REFERRED = 'already-referred',
}
