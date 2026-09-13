import {
  Module,
} from '@nestjs/common';

import {
  GithubEventsController,
} from './github-events.controller.js';

import {
  GithubEventsService,
} from './github-events.service.js';

@Module({
  controllers: [
    GithubEventsController,
  ],

  providers: [
    GithubEventsService,
  ],
})
export class GithubEventsModule {}