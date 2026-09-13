import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListPullRequestsQueryDto {
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
    message: 'repository deve estar no formato owner/repository',
  })
  repository?: string;

  @ApiPropertyOptional({
    example: 'open',
    enum: ['open', 'closed'],
  })
  @IsOptional()
  @IsIn(['open', 'closed'])
  state?: string;

  @ApiPropertyOptional({
    example: 'high',
    enum: ['low', 'medium', 'high'],
  })
  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  riskLevel?: string;

  @ApiPropertyOptional({
    example: 'blocked',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  policyStatus?: string;
}