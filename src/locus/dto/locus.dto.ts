import {
  IsArray,
  IsOptional,
  IsInt,
  IsString,
  Min,
  IsEnum,
} from 'class-validator';
import { SideloadEnum, SortFieldEnum, SortOrderEnum } from '../../common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class GetLocusDto {
  @ApiPropertyOptional({
    description: 'Filter by locusIsd',
    type: [Number],
  })
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

  @ApiPropertyOptional({
    description: 'Filter by assemblyId',
    type: Number,
  })
  @IsOptional()
  @IsString()
  assemblyId?: string;

  @ApiPropertyOptional({
    description: 'Filter by regionId',
    type: [Number],
  })
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

  @ApiPropertyOptional({
    description: 'Filter by membershipStatus',
    type: String,
  })
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

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Rows per page', default: 1000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 1000;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: SortFieldEnum,
    default: SortFieldEnum.ID,
  })
  @IsOptional()
  @IsEnum(SortFieldEnum)
  sortBy?: SortFieldEnum = SortFieldEnum.ID;

  @ApiPropertyOptional({
    description: 'Sort Order',
    enum: SortOrderEnum,
    default: SortOrderEnum.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  sortOrder?: SortOrderEnum = SortOrderEnum.ASC;
}
