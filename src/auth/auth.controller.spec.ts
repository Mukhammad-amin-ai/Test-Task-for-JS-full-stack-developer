import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';

const mockResponse = () =>
  ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  }) as unknown as Response;

describe('AuthController', () => {
  let controller: AuthController;

  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            findUser: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    })

      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('findUser', () => {
    it('делегирует в authService.findUser с sub из токена', () => {
      const mockUser = { id: 1, username: 'admin', role: 'admin' };
      authService.findUser.mockReturnValue(mockUser as any);

      const req = { user: { sub: 1 } } as any;
      const result = controller.findUser(req);

      expect(authService.findUser).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('делегирует в authService.login и возвращает результат', () => {
      const res = mockResponse();
      const dto = { username: 'admin', password: 'admin123' };

      authService.login.mockReturnValue({ message: 'Logged in successfully' });

      const result = controller.login(dto, res);

      expect(authService.login).toHaveBeenCalledWith(dto, res);
      expect(result).toEqual({ message: 'Logged in successfully' });
    });
  });

  describe('logout', () => {
    it('делегирует в authService.logout и возвращает результат', () => {
      const res = mockResponse();
      authService.logout.mockReturnValue({ message: 'Logged out' });

      const result = controller.logout(res);

      expect(authService.logout).toHaveBeenCalledWith(res);
      expect(result).toEqual({ message: 'Logged out' });
    });
  });
});
