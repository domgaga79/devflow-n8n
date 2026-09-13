import {
  Module,
} from '@nestjs/common';

import {
  ConfigModule,
} from '@nestjs/config';

import {
  DashboardModule,
} from './dashboard/dashboard.module.js';

import {
  GithubEventsModule,
} from './github-events/github-events.module.js';

import {
  HealthModule,
} from './health/health.module.js';

import {
  PrismaModule,
} from './prisma/prisma.module.js';

import {
  PullRequestsModule,
} from './pull-requests/pull-requests.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    HealthModule,
    PullRequestsModule,
    DashboardModule,
    GithubEventsModule,
  ],
})
export class AppModule {}