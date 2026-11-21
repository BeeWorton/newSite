-- One entry per anonymous browser identity per New York calendar day.
CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  day TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 700),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (token_hash, day)
);
CREATE INDEX IF NOT EXISTS idx_entries_day_rank ON entries (day, score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_entries_identity ON entries (token_hash);

-- v3 migration: an opt-in pool of browser tokens per player (no accounts).
CREATE TABLE IF NOT EXISTS identity_links (
  token_hash TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  linked_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_identity_links_player ON identity_links(player_id);
CREATE TABLE IF NOT EXISTS device_pair_codes (
  code_hash TEXT PRIMARY KEY,
  source_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  redeemed_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_device_pair_codes_expiry ON device_pair_codes(expires_at);
