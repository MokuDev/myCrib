import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { START_SIZE } from './catalog.mjs';

export function openDb(dataDir) {
  let db;
  if (dataDir === ':memory:') db = new DatabaseSync(':memory:');
  else { mkdirSync(dataDir, { recursive: true }); db = new DatabaseSync(join(dataDir, 'habit-island.db')); }
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS players (
      user_id INTEGER PRIMARY KEY,
      display_name TEXT NOT NULL,
      show_lb INTEGER NOT NULL DEFAULT 1,
      island_size INTEGER NOT NULL DEFAULT ${START_SIZE},
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES players(user_id),
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'check',
      weekdays INTEGER NOT NULL DEFAULT 127,
      created_date TEXT NOT NULL,
      archived_date TEXT
    );
    CREATE INDEX IF NOT EXISTS habits_user ON habits(user_id);
    CREATE TABLE IF NOT EXISTS completions (
      habit_id INTEGER NOT NULL REFERENCES habits(id),
      date TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      PRIMARY KEY (habit_id, date)
    );
    CREATE INDEX IF NOT EXISTS completions_user ON completions(user_id, date);
    CREATE TABLE IF NOT EXISTS ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      delta INTEGER NOT NULL,
      reason TEXT NOT NULL,
      ref TEXT,
      date TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS ledger_ref ON ledger(user_id, ref) WHERE ref IS NOT NULL;
    CREATE INDEX IF NOT EXISTS ledger_user ON ledger(user_id, date);
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item TEXT NOT NULL,
      x INTEGER,
      y INTEGER
    );
    CREATE UNIQUE INDEX IF NOT EXISTS inventory_tile ON inventory(user_id, x, y) WHERE x IS NOT NULL;
  `);
  return db;
}

export function tx(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; }
}

export const balance = (db, uid) =>
  db.prepare('SELECT COALESCE(SUM(delta),0) AS b FROM ledger WHERE user_id = ?').get(uid).b;
