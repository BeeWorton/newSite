-- v3: non-destructive migration for existing Kriljoona databases.
-- An opt-in pool of browser tokens per player (no accounts).
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
