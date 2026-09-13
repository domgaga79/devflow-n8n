export interface PullRequestMetrics {
  total: number;
  open: number;
  closed: number;
  merged: number;
  requiresReview: number;
}

export interface PolicyMetrics {
  passed: number;
  reviewRequired: number;
  blocked: number;
}

export interface RiskMetrics {
  low: number;
  medium: number;
  high: number;
}

export interface EventMetrics {
  github: number;
  analyses: number;
}

export interface LatestAnalysis {
  id: string;

  repository_full_name: string;
  pr_number: number;

  action?: string | null;

  risk_level: string | null;
  risk_score: number | null;

  size_classification?: string | null;

  policy_status: string | null;
  policy_decision?: string | null;
  policy_reason?: string | null;

  requires_review: boolean;

  breaking_change?: boolean;

  evaluated_at: string;
}

export interface DashboardSummary {
  pullRequests: PullRequestMetrics;
  policy: PolicyMetrics;
  risk: RiskMetrics;
  events: EventMetrics;

  latestAnalyses: LatestAnalysis[];

  generatedAt: string;
}