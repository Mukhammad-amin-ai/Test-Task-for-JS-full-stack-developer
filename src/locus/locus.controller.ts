import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LocusService } from './locus.service';
import { GetLocusDto } from './dto/locus.dto';
import { UserRole } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../shared/types';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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

@Controller('locus')
export class LocusController {
  constructor(private readonly locusService: LocusService) {}

  @Get()
  @ApiOperation({
    summary: 'Get locus records',
    description: `
**Permissions:**
- **admin** — all columns + sideloading available
- **normal** — only rl (rnc_locus) table columns, sideloading forbidden
- **limited** — only records where regionId IN (86118093, 86696489, 88186467)

**Sideloading:** pass \`include=locusMembers\` to get nested member records (admin only)
    `,
  })
  @ApiResponse({ status: 200, description: 'List of locus records' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UseGuards(JwtAuthGuard)
  getLocus(
    @Req() req: Request & { user: JwtPayload },
    @Query() dto: GetLocusDto,
  ) {
    const user = PREDEFINED_USERS.find((u) => u.id === req.user.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.locusService.getLocus(dto, user);
  }
}
