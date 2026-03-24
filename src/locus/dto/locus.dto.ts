import {
  IsArray,
  IsOptional,
  IsInt,
  IsNumber,
  IsString,
  Min,
  IsEnum,
} from 'class-validator';
import { SideloadEnum, SortFieldEnum, SortOrderEnum } from '../../shared/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class GetLocusDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;

    if (Array.isArray(value)) {
      return value.map(Number);
    }

    return [Number(value)];
  })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  id?: number[];

  @IsOptional()
  @IsNumber()
  assemblyId?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;

    if (Array.isArray(value)) {
      return value.map(Number);
    }

    return [Number(value)];
  })
  @IsArray()
  @IsInt({ each: true })
  regionId?: number[];

  @IsOptional()
  @IsString()
  membershipStatus?: string;

  @ApiPropertyOptional({
    description: 'Sideload related data',
    enum: SideloadEnum,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(SideloadEnum, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  include?: SideloadEnum[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @IsNumber()
  limit?: number = 1000;

  @IsOptional()
  @IsEnum(SortFieldEnum)
  sortBy?: SortFieldEnum = SortFieldEnum.ID;

  @IsOptional()
  @IsEnum(SortOrderEnum)
  sortOrder?: SortOrderEnum = SortOrderEnum.ASC;
}
