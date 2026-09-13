CREATE SCHEMA IF NOT EXISTS devflow;

CREATE TABLE IF NOT EXISTS devflow.github_events (
    id BIGSERIAL PRIMARY KEY,
    delivery_id VARCHAR(100),
    event_type VARCHAR(100) NOT NULL,
    action VARCHAR(100),
    repository_full_name VARCHAR(255),
    sender_login VARCHAR(255),
    issue_number INTEGER,
    issue_title TEXT,
    issue_url TEXT,
    classification VARCHAR(50),
    priority VARCHAR(30),
    payload JSONB NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_github_events_delivery_id
    ON devflow.github_events(delivery_id)
    WHERE delivery_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_github_events_repository
    ON devflow.github_events(repository_full_name);

CREATE INDEX IF NOT EXISTS idx_github_events_received_at
    ON devflow.github_events(received_at DESC);
