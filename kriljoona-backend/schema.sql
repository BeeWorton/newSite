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
