import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Response } from 'express';

const mockResponse = () =>
  ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  }) as unknown as Response;

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('findUser', () => {
    it('returns the user by an existing id', () => {
      const user = service.findUser(1);
      expect(user).toMatchObject({ id: 1, username: 'admin' });
    });

    it('throws an UnauthorizedException when an id does not exist', () => {
      expect(() => service.findUser(999)).toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('returns a successful message and sets a cookie', () => {
      const res = mockResponse();
      const result = service.login(
        { username: 'admin', password: 'admin123' },
        res,
      );

      expect(result).toEqual({ message: 'Logged in successfully' });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 1, role: 'admin', username: 'admin' },
        expect.objectContaining({ secret: process.env.JWT_ACCESS_SECRET }),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock-token',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('throws an UnauthorizedException for invalid credentials', () => {
      const res = mockResponse();
      expect(() =>
        service.login({ username: 'admin', password: 'wrong' }, res),
      ).toThrow(UnauthorizedException);
    });

    it('does not set cookies for incorrect credentials', () => {
      const res = mockResponse();
      try {
        service.login({ username: 'admin', password: 'wrong' }, res);
      } catch {}
      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('calls clearCookie for access_token', () => {
      const res = mockResponse();
      service.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
    });

    it('returns an exit message', () => {
      const res = mockResponse();
      expect(service.logout(res)).toEqual({ message: 'Logged out' });
    });
  });
});
