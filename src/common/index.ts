import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

export interface JwtPayload {
  sub: number;
  username: string;
  role: 'admin' | 'normal' | 'limited';
}

export enum SideloadEnum {
  LOCUS_MEMBERS = 'locusMembers',
}

export enum SortFieldEnum {
  ID = 'id',
  ASSEMBLY_ID = 'assemblyId',
  LOCUS_START = 'locusStart',
  LOCUS_STOP = 'locusStop',
  MEMBER_COUNT = 'memberCount',
  CHROMOSOME = 'chromosome',
}

export enum SortOrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type UserRole = 'admin' | 'normal' | 'limited';

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
}

export const PREDEFINED_USERS: User[] = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'normal', password: 'normal123', role: 'normal' },
  { id: 3, username: 'limited', password: 'limited123', role: 'limited' },
];

export const LIMITED_REGION_IDS = [86118093, 86696489, 88186467];
