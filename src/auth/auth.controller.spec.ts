import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  const req = {
    cookies: {
      refresh_token: 'refreshToken',
    },
  };

  const res = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  // ======================
  // REGISTER
  // ======================

  it('should register user', async () => {
    const dto = {
      email: 'test@mail.com',
      password: '123',
      confirmPassword: '123',
    };

    authService.register.mockResolvedValue({
      message: 'Registered and logged in successfully',
    });

    const result = await controller.registration(
      dto as any,
      res as any,
      req as any,
    );

    expect(authService.register).toHaveBeenCalledWith(dto, req, res);
    expect(result).toEqual({
      message: 'Registered and logged in successfully',
    });
  });

  // ======================
  // LOGIN
  // ======================

  it('should login user', async () => {
    const dto = { email: 'test@mail.com', password: '123' };

    authService.login.mockResolvedValue({
      message: 'Logged in successfully',
    });

    const result = await controller.login(dto as any, req as any, res as any);

    expect(authService.login).toHaveBeenCalledWith(dto, req, res);
    expect(result).toEqual({ message: 'Logged in successfully' });
  });

  // ======================
  // REFRESH
  // ======================

  it('should refresh token', async () => {
    authService.refresh.mockResolvedValue({
      message: 'Token refreshed successfully',
    });

    const result = await controller.refresh(req as any, res as any);

    expect(authService.refresh).toHaveBeenCalledWith(
      res,
      req.cookies.refresh_token,
    );

    expect(result).toEqual({
      message: 'Token refreshed successfully',
    });
  });

  // ======================
  // LOGOUT
  // ======================

  it('should logout user', async () => {
    authService.logout.mockResolvedValue({
      message: 'Logged out',
    });

    const result = await controller.logout(req as any, res as any);

    expect(authService.logout).toHaveBeenCalledWith(
      res,
      req.cookies.refresh_token,
    );

    expect(result).toEqual({ message: 'Logged out' });
  });

  // ======================
  // FORGOT PASSWORD
  // ======================

  it('should request password reset', async () => {
    const dto = { email: 'test@mail.com' };

    authService.forgotPassword.mockResolvedValue({
      message: 'Resetting Email Sent Successfully',
    });

    const result = await controller.forgotReq(dto as any);

    expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      message: 'Resetting Email Sent Successfully',
    });
  });

  // ======================
  // RESET PASSWORD
  // ======================

  it('should reset password', async () => {
    const dto = {
      token: 'token',
      password: '123',
      confirmPassword: '123',
    };

    authService.resetPassword.mockResolvedValue({
      message: 'Password has been reset successfully',
    });

    const result = await controller.resetReq(dto as any);

    expect(authService.resetPassword).toHaveBeenCalledWith(dto);

    expect(result).toEqual({
      message: 'Password has been reset successfully',
    });
  });
});
