import * as bcrypt from 'bcrypt';

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { User } from '@modules/user/entities/user.entity';
import { Session } from './entities/session.entity';

import { JwtService } from '@nestjs/jwt';
import { MailService } from '@infrastructure/mail/mail.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('AuthService', () => {
  let service: AuthService;

  const usersRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const sessionsRepo = {
    save: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
  };

  const jwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  };

  const mailService = {
    sendMail: jest.fn(),
  };

  const cacheManager = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  const res = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  const req = {
    headers: { 'user-agent': 'jest' },
    socket: { remoteAddress: '127.0.0.1' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
        { provide: CACHE_MANAGER, useValue: cacheManager },
        { provide: getRepositoryToken(User), useValue: usersRepo },
        { provide: getRepositoryToken(Session), useValue: sessionsRepo },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  // ========================
  // REGISTER
  // ========================

  it('should throw if email exists', async () => {
    usersRepo.findOne.mockResolvedValue({});

    await expect(
      service.register(
        { email: 'test@mail.com' } as any,
        req as any,
        res as any,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw if passwords mismatch', async () => {
    usersRepo.findOne.mockResolvedValue(null);

    await expect(
      service.register(
        {
          email: 'test@mail.com',
          password: '1',
          confirmPassword: '2',
        } as any,
        req as any,
        res as any,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should register user', async () => {
    usersRepo.findOne.mockResolvedValue(null);

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash' as never);

    usersRepo.create.mockReturnValue({ id: '1' });
    usersRepo.save.mockResolvedValue({ id: '1' });

    jwtService.sign.mockReturnValue('token');

    await service.register(
      {
        email: 'test@mail.com',
        password: '123',
        confirmPassword: '123',
      } as any,
      req as any,
      res as any,
    );

    expect(usersRepo.save).toHaveBeenCalled();
    expect(sessionsRepo.save).toHaveBeenCalled();
  });

  // ========================
  // LOGIN
  // ========================

  it('should throw invalid credentials', async () => {
    usersRepo.findOne.mockResolvedValue(null);

    await expect(
      service.login(
        { email: 'a', password: 'b' } as any,
        req as any,
        res as any,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should login user', async () => {
    usersRepo.findOne.mockResolvedValue({
      id: '1',
      email: 'test@mail.com',
      password: 'hash',
    });

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    jwtService.sign.mockReturnValue('token');

    await service.login(
      { email: 'test@mail.com', password: '123' } as any,
      req as any,
      res as any,
    );

    expect(sessionsRepo.save).toHaveBeenCalled();
  });

  // ========================
  // REFRESH
  // ========================

  it('should throw if token invalid', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error());

    await expect(service.refresh(res as any, 'token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should refresh token', async () => {
    jwtService.verifyAsync.mockResolvedValue({});
    jwtService.decode.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 10000,
    });

    sessionsRepo.findOne.mockResolvedValue({
      user: { id: '1', email: 'a@mail.com' },
    });

    jwtService.sign.mockReturnValue('newToken');

    const result = await service.refresh(res as any, 'token');

    expect(result).toEqual({ message: 'Token refreshed successfully' });
  });

  // ========================
  // LOGOUT
  // ========================

  it('should logout user', async () => {
    sessionsRepo.delete.mockResolvedValue({});

    const result = await service.logout(res as any, 'token');

    expect(res.clearCookie).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Logged out' });
  });

  // ========================
  // RESET PASSWORD
  // ========================

  it('should throw if passwords mismatch', async () => {
    await expect(
      service.resetPassword({
        password: '1',
        confirmPassword: '2',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reset password', async () => {
    cacheManager.get.mockResolvedValue('test@mail.com');

    usersRepo.findOne.mockResolvedValue({
      email: 'test@mail.com',
      password: 'oldhash',
    });

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('newhash' as never);

    const result = await service.resetPassword({
      token: 'token',
      password: '123',
      confirmPassword: '123',
    });

    expect(usersRepo.save).toHaveBeenCalled();
    expect(cacheManager.del).toHaveBeenCalled();
    expect(mailService.sendMail).toHaveBeenCalled();

    expect(result).toEqual({
      message: 'Password has been reset successfully',
    });
  });
});
