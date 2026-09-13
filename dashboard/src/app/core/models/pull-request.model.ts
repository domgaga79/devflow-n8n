export type PullRequestState =
  | 'open'
  | 'closed'
  | string;

export type RiskLevel =
  | 'low'
  | 'medium'
  | 'high'
  | null;

export type PolicyStatus =
  | 'passed'
  | 'review_required'
  | 'blocked'
  | string
  | null;

export interface ChangedFileDetail {
  filename: string;
  status: string;

  additions: number;
  deletions: number;
  changes: number;

  rawUrl?: string | null;
  blobUrl?: string | null;
  previousFilename?: string | null;
}

export interface CommitDetail {
  sha: string;
  shortSha?: string;

  url?: string | null;
  date?: string | null;

  author?: string | null;
  message?: string | null;
}

export interface PolicyCheck {
  check: string;

  passed?: boolean;

  message?: string | null;
  severity?: string | null;

  files?: string[];
}

export interface PullRequest {
  id: string;

  repository_full_name: string;
  pr_number: number;

  last_delivery_id?: string | null;

  action?: string | null;
  state: PullRequestState | null;

  title: string | null;
  body?: string | null;

  author_login?: string | null;
  html_url?: string | null;

  draft: boolean;
  merged: boolean;

  head_ref?: string | null;
  head_sha?: string | null;

  base_ref?: string | null;
  base_sha?: string | null;

  commits: number;
  changed_files: number;
  additions: number;
  deletions: number;

  github_created_at?: string | null;
  github_updated_at?: string | null;
  github_closed_at?: string | null;
  github_merged_at?: string | null;

  received_at?: string;
  updated_at: string;

  changed_files_detail?: ChangedFileDetail[];
  commit_details?: CommitDetail[];

  technical_summary?: string | null;

  analysis_updated_at?: string | null;

  risk_level: RiskLevel;
  risk_score: number | null;

  size_classification?: string | null;

  impact_areas?: string[];

  breaking_change: boolean;

  sensitive_files?: string[];

  review_recommendation?: string | null;

  policy_status: PolicyStatus;
  policy_decision?: string | null;
  policy_reason?: string | null;

  requires_review: boolean;

  policy_checks?: PolicyCheck[];

  policy_evaluated_at?: string | null;
}

export interface PullRequestPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PullRequestFilters {
  repository: string | null;
  state: string | null;
  riskLevel: string | null;
  policyStatus: string | null;
}

export interface PullRequestsResponse {
  data: PullRequest[];
  meta: PullRequestPaginationMeta;
  filters: PullRequestFilters;
}

export interface PullRequestsQuery {
  page?: number;
  limit?: number;

  repository?: string;
  state?: string;
  riskLevel?: string;
  policyStatus?: string;
}

export interface PullRequestHistoryItem {
  id: string;

  repository_full_name: string;
  pr_number: number;

  delivery_id?: string | null;

  action?: string | null;

  head_sha?: string | null;

  risk_level: RiskLevel;
  risk_score: number | null;

  size_classification?: string | null;

  impact_areas?: string[];

  breaking_change: boolean;

  sensitive_files?: string[];

  policy_status: PolicyStatus;
  policy_decision?: string | null;
  policy_reason?: string | null;

  requires_review: boolean;

  commits?: number | null;
  changed_files?: number | null;
  additions?: number | null;
  deletions?: number | null;

  evaluated_at: string;
}

export interface PullRequestHistoryResponse {
  pullRequest: {
    repository: string;
    number: number;
    title: string | null;
    state: string | null;
  };

  total: number;

  history: PullRequestHistoryItem[];
}