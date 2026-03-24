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
    it('возвращает пользователя по существующему id', () => {
      const user = service.findUser(1);
      expect(user).toMatchObject({ id: 1, username: 'admin' });
    });

    it('бросает UnauthorizedException при несуществующем id', () => {
      expect(() => service.findUser(999)).toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('возвращает успешное сообщение и ставит cookie', () => {
      const res = mockResponse();
      const result = service.login(
        { username: 'admin', password: 'admin123' },
        res,
      );

      expect(result).toEqual({ message: 'Logged in successfully' });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 1, role: 'admin', username: 'admin' },
        expect.objectContaining({ secret: expect.any(String) }),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock-token',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('бросает UnauthorizedException при неверных credentials', () => {
      const res = mockResponse();
      expect(() =>
        service.login({ username: 'admin', password: 'wrong' }, res),
      ).toThrow(UnauthorizedException);
    });

    it('не ставит cookie при неверных credentials', () => {
      const res = mockResponse();
      try {
        service.login({ username: 'admin', password: 'wrong' }, res);
      } catch {}
      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('вызывает clearCookie для access_token', () => {
      const res = mockResponse();
      service.logout(res);
      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
    });

    it('возвращает сообщение о выходе', () => {
      const res = mockResponse();
      expect(service.logout(res)).toEqual({ message: 'Logged out' });
    });
  });
});
