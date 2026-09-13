import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [
      total,
      open,
      closed,
      merged,
      requiresReview,
      policyPassed,
      policyReviewRequired,
      policyBlocked,
      riskLow,
      riskMedium,
      riskHigh,
      totalGithubEvents,
      totalAnalyses,
      latestAnalyses,
    ] = await Promise.all([
      this.prisma.pull_requests.count(),

      this.prisma.pull_requests.count({
        where: {
          state: 'open',
        },
      }),

      this.prisma.pull_requests.count({
        where: {
          state: 'closed',
        },
      }),

      this.prisma.pull_requests.count({
        where: {
          merged: true,
        },
      }),

      this.prisma.pull_requests.count({
        where: {
          requires_review: true,
        },
      }),

      this.prisma.pull_requests.count({
        where: {
          policy_status: 'passed',
        },
      }),

      this.prisma.pull_requests.count({
        where: {
          policy_status: 'review_required',
        },
      }),

      this.prisma.pull_requests.count({
        where: {
          policy_status: 'blocked',
        },
      }),

      this.prisma.pull_requests.count({
        where: {
          risk_level: 'low',
        },
      }),

      this.prisma.pull_requests.count({
        where: {
          risk_level: 'medium',
        },
      }),

      this.prisma.pull_requests.count({
        where: {
          risk_level: 'high',
        },
      }),

      this.prisma.github_events.count(),

      this.prisma.pr_analysis_history.count(),

      this.prisma.pr_analysis_history.findMany({
        orderBy: {
          evaluated_at: 'desc',
        },
        take: 10,
      }),
    ]);

    return {
      pullRequests: {
        total,
        open,
        closed,
        merged,
        requiresReview,
      },

      policy: {
        passed: policyPassed,
        reviewRequired: policyReviewRequired,
        blocked: policyBlocked,
      },

      risk: {
        low: riskLow,
        medium: riskMedium,
        high: riskHigh,
      },

      events: {
        github: totalGithubEvents,
        analyses: totalAnalyses,
      },

      latestAnalyses,

      generatedAt: new Date().toISOString(),
    };
  }
}