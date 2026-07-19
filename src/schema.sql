-- PantryAI schema. Tables are created on first run.

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  dietary TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS saved_recipes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  saved_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS pantry_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Other',
  expires_on TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
