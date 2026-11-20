import type { JournalEntry } from './journal';
import { cleanItems } from './journal';

type SqlValue = string | number | null;

export type Database = {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: SqlValue[]): Promise<{ lastInsertRowId: number }>;
  getFirstAsync<T>(sql: string, ...params: SqlValue[]): Promise<T | null>;
  getAllAsync<T>(sql: string, ...params: SqlValue[]): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
};

type EntryRow = {
  date: string;
  created_at: string;
  updated_at: string;
  items: string;
};

export async function initializeJournalDatabase(database: Database): Promise<void> {
  await database.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS journal_entries (
      date TEXT PRIMARY KEY NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS journal_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_date TEXT NOT NULL REFERENCES journal_entries(date) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      text TEXT NOT NULL,
      UNIQUE(entry_date, position)
    );
  `);
}

export async function saveEntry(
  database: Database,
  date: string,
  items: string[],
  now = new Date().toISOString(),
): Promise<JournalEntry> {
  const normalizedItems = cleanItems(items);
  if (normalizedItems.length < 3) {
    throw new Error('An entry must contain at least three non-empty items.');
  }

  let createdAt = now;
  await database.withTransactionAsync(async () => {
    const existing = await database.getFirstAsync<{ created_at: string }>(
      'SELECT created_at FROM journal_entries WHERE date = ?',
      date,
    );
    createdAt = existing?.created_at ?? now;

    await database.runAsync(
      `INSERT INTO journal_entries (date, created_at, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET updated_at = excluded.updated_at`,
      date,
      createdAt,
      now,
    );
    await database.runAsync('DELETE FROM journal_items WHERE entry_date = ?', date);
    for (const [position, text] of normalizedItems.entries()) {
      await database.runAsync(
        'INSERT INTO journal_items (entry_date, position, text) VALUES (?, ?, ?)',
        date,
        position,
        text,
      );
    }
  });

  return { date, items: normalizedItems, createdAt, updatedAt: now };
}

function rowToEntry(row: EntryRow): JournalEntry {
  return {
    date: row.date,
    items: JSON.parse(row.items) as string[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getEntry(database: Database, date: string): Promise<JournalEntry | null> {
  const row = await database.getFirstAsync<EntryRow>(
    `SELECT e.date, e.created_at, e.updated_at,
            COALESCE(json_group_array(i.text ORDER BY i.position), '[]') AS items
     FROM journal_entries e
     LEFT JOIN journal_items i ON i.entry_date = e.date
     WHERE e.date = ?
     GROUP BY e.date`,
    date,
  );
  return row ? rowToEntry(row) : null;
}

export async function listEntries(database: Database): Promise<JournalEntry[]> {
  const rows = await database.getAllAsync<EntryRow>(
    `SELECT e.date, e.created_at, e.updated_at,
            COALESCE(json_group_array(i.text ORDER BY i.position), '[]') AS items
     FROM journal_entries e
     LEFT JOIN journal_items i ON i.entry_date = e.date
     GROUP BY e.date
     ORDER BY e.date DESC`,
  );
  return rows.map(rowToEntry);
}
