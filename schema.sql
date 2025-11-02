-- Schema for EchoVerse (stories table)
-- You can apply this later. For now we create the file but will not run it automatically.

CREATE TABLE IF NOT EXISTS stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
