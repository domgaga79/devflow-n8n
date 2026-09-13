import { Type } from 'class-transformer';

import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class ListGithubEventsQueryDto {
  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'domgaga79/devflow-n8n',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[^/\s]+\/[^/\s]+$/, {
    message:
      'repository deve estar no formato owner/repository',
  })
  repository?: string;

  @ApiPropertyOptional({
    example: 'pull_request',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  eventType?: string;

  @ApiPropertyOptional({
    example: 'closed',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  action?: string;

  @ApiPropertyOptional({
    example: 'security',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  classification?: string;

  @ApiPropertyOptional({
    example: 'high',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  priority?: string;
}