import { Module } from '@nestjs/common';
import { PullRequestsController } from './pull-requests.controller.js';
import { PullRequestsService } from './pull-requests.service.js';

@Module({
  controllers: [PullRequestsController],
  providers: [PullRequestsService],
  exports: [PullRequestsService],
})
export class PullRequestsModule {}