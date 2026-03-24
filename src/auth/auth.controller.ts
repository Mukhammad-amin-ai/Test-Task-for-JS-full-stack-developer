import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  UseGuards,
  Get,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { Response } from 'express';
import { JwtPayload } from '../shared/types';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check is user Authenticated' })
  @ApiResponse({ status: 200, description: 'Logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UseGuards(JwtAuthGuard)
  findUser(@Req() req: Request & { user: JwtPayload }) {
    return this.authService.findUser(req.user.sub);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({
    schema: {
      example: { username: 'admin', password: 'admin123' },
    },
  })
  @ApiResponse({ status: 200, description: 'Login user' })
  login(
    @Body() dto: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}
