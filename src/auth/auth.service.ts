import { CookieOptions, Response } from 'express';

import { UnauthorizedException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type UserRole = 'admin' | 'normal' | 'limited';

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
}

const PREDEFINED_USERS: User[] = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'normal', password: 'normal123', role: 'normal' },
  { id: 3, username: 'limited', password: 'limited123', role: 'limited' },
];

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  findUser(userId: number) {
    const user = PREDEFINED_USERS.find((u) => u.id === userId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  login(dto: { username: string; password: string }, res: Response) {
    const user = PREDEFINED_USERS.find(
      (u) => u.username === dto.username && u.password === dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    this.authorizeUser(user, res);

    return { message: 'Logged in successfully' };
  }

  logout(res: Response): { message: string } {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    };

    res.clearCookie('access_token', cookieOptions);
    return { message: 'Logged out' };
  }

  private authorizeUser(user: User, res: Response) {
    const accessMaxAge = 24 * 60 * 60 * 1000;

    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role, username: user.username },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: accessMaxAge },
    );

    this.setCookies(res, accessToken, accessMaxAge);
  }

  private setCookies(
    res: Response,
    accessToken: string,
    accessMaxAge: number,
  ): void {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: accessMaxAge,
    });
  }
}
