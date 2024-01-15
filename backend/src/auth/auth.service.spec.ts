import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { User } from 'src/users/users.entity';
import { TokenType } from './auth.enum';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useClass: JwtService,
        },
      ],
    })
      .overrideProvider(JwtService)
      .useFactory({
        factory: () => ({
          sign: jest.fn((type) =>
            type === TokenType.access ? 'access-token' : 'refresh-token',
          ),
          verify: jest.fn((id) => ({ id })),
        }),
      })
      .compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('register', () => {
    it('should create a User and return the object', async () => {
      const mockUser = {
        username: 'kryptoblack',
        password: 'test123',
        fullName: 'Krypto Black',
      };
      const savedUser = {
        id: 2,
        isActive: true,
        isAdmin: false,
        salt: 'string',
        balance: 0,
        referral: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...mockUser,
      };
      jest.spyOn(userRepository, 'create').mockReturnValueOnce(savedUser);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(savedUser);

      const result = await authService.register(mockUser);
      expect(result).toEqual(savedUser);
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const credentials = { username: 'kryptoblack', password: 'test123' };
      const savedUser = {
        id: 2,
        fullName: 'Krypto Black',
        username: 'kryptoblack',
        password:
          'c235689f41a62e2b09898c05049bd8b94014e71f56423a3556be3310ea4c838c',
        isActive: true,
        isAdmin: false,
        salt: 'test',
        balance: 0,
        referral: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(savedUser);

      const result = await authService.login(credentials);
      expect(result).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('should throw UnauthorizedException for invalid details', async () => {
      try {
        const credentials = { username: 'kryptoblack', password: 'test' };
        const savedUser = {
          id: 2,
          fullName: 'Krypto Black',
          username: 'kryptoblack',
          password:
            'c235689f41a62e2b09898c05049bd8b94014e71f56423a3556be3310ea4c838c',
          isActive: true,
          isAdmin: false,
          salt: 'test',
          balance: 0,
          referral: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(savedUser);
        await authService.login(credentials);
        fail('should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual('Invalid login details');
      }
    });
  });

  describe('refresh', () => {
    it('should return a new access token', async () => {
      const result = await authService.refresh({ id: 1 });
      expect(result).toEqual({
        accessToken: expect.any(String),
      });
    });
  });
});
