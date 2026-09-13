import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import type { ListPullRequestsQueryDto } from './dto/list-pull-requests-query.dto.js';

@Injectable()
export class PullRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: ListPullRequestsQueryDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const skip = (page - 1) * limit;

    const where = {
      ...(filters.repository
        ? {
            repository_full_name: filters.repository,
          }
        : {}),

      ...(filters.state
        ? {
            state: filters.state,
          }
        : {}),

      ...(filters.riskLevel
        ? {
            risk_level: filters.riskLevel,
          }
        : {}),

      ...(filters.policyStatus
        ? {
            policy_status: filters.policyStatus,
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.pull_requests.findMany({
        where,
        orderBy: {
          updated_at: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prisma.pull_requests.count({
        where,
      }),
    ]);

    return {
      data: items,

      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },

      filters: {
        repository: filters.repository ?? null,
        state: filters.state ?? null,
        riskLevel: filters.riskLevel ?? null,
        policyStatus: filters.policyStatus ?? null,
      },
    };
  }

  async findOne(
    prNumber: number,
    repository?: string,
  ) {
    const results =
      await this.prisma.pull_requests.findMany({
        where: {
          pr_number: prNumber,

          ...(repository
            ? {
                repository_full_name: repository,
              }
            : {}),
        },

        orderBy: {
          updated_at: 'desc',
        },

        take: repository ? 1 : 2,
      });

    if (results.length === 0) {
      throw new NotFoundException(
        repository
          ? `PR #${prNumber} não encontrado em ${repository}.`
          : `PR #${prNumber} não encontrado.`,
      );
    }

    if (!repository && results.length > 1) {
      throw new BadRequestException(
        `Existe mais de um PR #${prNumber}. Informe ?repository=owner/repository.`,
      );
    }

    return results[0];
  }

  async history(
    prNumber: number,
    repository?: string,
  ) {
    const pullRequest = await this.findOne(
      prNumber,
      repository,
    );

    const history =
      await this.prisma.pr_analysis_history.findMany({
        where: {
          pr_number: prNumber,
          repository_full_name:
            pullRequest.repository_full_name,
        },

        orderBy: {
          evaluated_at: 'desc',
        },
      });

    return {
      pullRequest: {
        repository:
          pullRequest.repository_full_name,
        number: pullRequest.pr_number,
        title: pullRequest.title,
        state: pullRequest.state,
      },

      total: history.length,
      history,
    };
  }
}