export interface GithubEvent {
  id: string;

  delivery_id: string | null;

  event_type: string;
  action: string | null;

  repository_full_name: string | null;
  sender_login: string | null;

  issue_number: number | null;
  issue_title: string | null;
  issue_url: string | null;

  classification: string | null;
  priority: string | null;

  payload?: unknown;

  received_at: string;
}

export interface GithubEventsPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GithubEventsFilters {
  repository: string | null;
  eventType: string | null;
  action: string | null;
  classification: string | null;
  priority: string | null;
}

export interface GithubEventsResponse {
  data: GithubEvent[];
  meta: GithubEventsPaginationMeta;
  filters: GithubEventsFilters;
}

export interface GithubEventsQuery {
  page?: number;
  limit?: number;

  repository?: string;
  eventType?: string;
  action?: string;
  classification?: string;
  priority?: string;
}