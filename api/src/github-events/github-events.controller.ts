import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import {
  ListGithubEventsQueryDto,
} from './dto/list-github-events-query.dto.js';

import {
  GithubEventsService,
} from './github-events.service.js';

@ApiTags('GitHub Events')
@Controller('api/github-events')
export class GithubEventsController {
  constructor(
    private readonly service:
      GithubEventsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Lista eventos recebidos do GitHub',
  })
  findAll(
    @Query()
    query:
      ListGithubEventsQueryDto,
  ) {
    return this.service.findAll(
      query,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Retorna um evento GitHub pelo ID',
  })
  @ApiParam({
    name: 'id',
    example: '1',
  })
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.service.findOne(
      id,
    );
  }
}