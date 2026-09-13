import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

import type {
  ListGithubEventsQueryDto,
} from './dto/list-github-events-query.dto.js';

@Injectable()
export class GithubEventsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async findAll(
    query: ListGithubEventsQueryDto,
  ) {
    const page =
      query.page ?? 1;

    const limit =
      query.limit ?? 20;

    const where = {
      ...(query.repository
        ? {
            repository_full_name:
              query.repository,
          }
        : {}),

      ...(query.eventType
        ? {
            event_type:
              query.eventType,
          }
        : {}),

      ...(query.action
        ? {
            action:
              query.action,
          }
        : {}),

      ...(query.classification
        ? {
            classification:
              query.classification,
          }
        : {}),

      ...(query.priority
        ? {
            priority:
              query.priority,
          }
        : {}),
    };

    const [
      data,
      total,
    ] = await Promise.all([
      this.prisma.github_events.findMany({
        where,

        orderBy: {
          received_at: 'desc',
        },

        skip:
          (page - 1) * limit,

        take: limit,
      }),

      this.prisma.github_events.count({
        where,
      }),
    ]);

    return {
      data,

      meta: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(
            total / limit,
          ),

        hasNextPage:
          page * limit < total,

        hasPreviousPage:
          page > 1,
      },

      filters: {
        repository:
          query.repository ?? null,

        eventType:
          query.eventType ?? null,

        action:
          query.action ?? null,

        classification:
          query.classification ?? null,

        priority:
          query.priority ?? null,
      },
    };
  }

  async findOne(
    id: string,
  ) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException(
        'ID do evento deve ser numérico.',
      );
    }

    const event =
      await this.prisma.github_events.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!event) {
      throw new NotFoundException(
        `GitHub Event #${id} não encontrado.`,
      );
    }

    return event;
  }
}