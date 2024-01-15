import { TokenType } from 'src/auth/auth.enum';

export interface IAccessToken {
  accessToken: string;
}

export interface ITokens extends IAccessToken {
  refreshToken: string;
}

export interface IJwtPayload {
  sub: string;
  type: TokenType;
}

export interface IAuthenticatedUser {
  id: number;
}
