import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ListPullRequestsQueryDto } from './dto/list-pull-requests-query.dto.js';
import { PullRequestsService } from './pull-requests.service.js';

@ApiTags('Pull Requests')
@Controller('api/pull-requests')
export class PullRequestsController {
  constructor(
    private readonly pullRequestsService: PullRequestsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lista Pull Requests analisados pelo DevFlow',
  })
  async findAll(
    @Query() query: ListPullRequestsQueryDto,
  ) {
    return this.pullRequestsService.findAll(query);
  }

  @Get(':number/history')
  @ApiOperation({
    summary: 'Retorna o histórico de análises de um Pull Request',
  })
  @ApiParam({
    name: 'number',
    example: 8,
    type: Number,
  })
  @ApiQuery({
    name: 'repository',
    required: false,
    example: 'domgaga79/devflow-n8n',
  })
  async history(
    @Param('number', ParseIntPipe) number: number,
    @Query('repository') repository?: string,
  ) {
    return this.pullRequestsService.history(
      number,
      repository,
    );
  }

  @Get(':number')
  @ApiOperation({
    summary: 'Retorna os detalhes de um Pull Request',
  })
  @ApiParam({
    name: 'number',
    example: 8,
    type: Number,
  })
  @ApiQuery({
    name: 'repository',
    required: false,
    example: 'domgaga79/devflow-n8n',
  })
  async findOne(
    @Param('number', ParseIntPipe) number: number,
    @Query('repository') repository?: string,
  ) {
    return this.pullRequestsService.findOne(
      number,
      repository,
    );
  }
}