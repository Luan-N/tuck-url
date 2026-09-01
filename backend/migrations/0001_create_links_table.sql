-- Migration number: 0001 	 2026-09-01T06:48:48.565Z
CREATE TABLE links (
  code TEXT PRIMARY KEY,
  original_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT
);