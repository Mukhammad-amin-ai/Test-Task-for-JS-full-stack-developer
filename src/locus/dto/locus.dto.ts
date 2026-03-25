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
  @IsString()
  assemblyId?: string;

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
    description: 'Include locus members sideload',
    enum: SideloadEnum,
  })
  @IsOptional()
  @IsEnum(SideloadEnum)
  include?: SideloadEnum;

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
