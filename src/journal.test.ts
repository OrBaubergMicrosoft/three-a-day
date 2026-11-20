import { cleanItems, localDateKey, validateItems } from './journal';
import { getEntry, listEntries, saveEntry, type Database } from './journalRepository';

class FakeDatabase implements Database {
  private entries = new Map<string, { created_at: string; updated_at: string }>();
  private items = new Map<string, string[]>();
  failOnItemPosition: number | null = null;

  async execAsync() {}

  async withTransactionAsync(task: () => Promise<void>) {
    const entries = new Map(this.entries);
    const items = new Map([...this.items].map(([date, values]) => [date, [...values]]));
    try {
      await task();
    } catch (error) {
      this.entries = entries;
      this.items = items;
      throw error;
    }
  }

  async runAsync(sql: string, ...params: (string | number | null)[]) {
    if (sql.startsWith('INSERT INTO journal_entries')) {
      const [date, createdAt, updatedAt] = params as [string, string, string];
      this.entries.set(date, { created_at: createdAt, updated_at: updatedAt });
    } else if (sql.startsWith('DELETE FROM journal_items')) {
      this.items.set(params[0] as string, []);
    } else if (sql.startsWith('INSERT INTO journal_items')) {
      const [date, position, text] = params as [string, number, string];
      if (position === this.failOnItemPosition) {
        throw new Error('Simulated storage error.');
      }
      const items = this.items.get(date) ?? [];
      items[position] = text;
      this.items.set(date, items);
    }
    return { lastInsertRowId: 1 };
  }

  async getFirstAsync<T>(sql: string, ...params: (string | number | null)[]) {
    const date = params[0] as string;
    if (sql.startsWith('SELECT created_at')) {
      return (this.entries.get(date) ?? null) as T | null;
    }
    const entry = this.entries.get(date);
    return (entry
      ? {
          date,
          ...entry,
          items: JSON.stringify(this.items.get(date) ?? []),
        }
      : null) as T | null;
  }

  async getAllAsync<T>() {
    return [...this.entries.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, entry]) => ({
        date,
        ...entry,
        items: JSON.stringify(this.items.get(date) ?? []),
      })) as T[];
  }
}

describe('journal input rules', () => {
  it('uses the device local calendar date', () => {
    expect(localDateKey(new Date(2026, 0, 9, 23, 59))).toBe('2026-01-09');
  });

  it('trims and removes blank items', () => {
    expect(cleanItems([' first ', '', '  ', 'second'])).toEqual(['first', 'second']);
  });

  it('rejects fewer than three non-empty items', () => {
    expect(validateItems(['one', ' two ', ''])).toContain('at least 3');
    expect(validateItems(['one', 'two', 'three'])).toBeNull();
  });
});

describe('journal persistence', () => {
  it('saves, retrieves, orders, and updates one entry per date', async () => {
    const database = new FakeDatabase();
    await saveEntry(database, '2026-01-09', [' first ', 'second', 'third'], '2026-01-09T08:00:00.000Z');
    await saveEntry(database, '2026-01-08', ['older one', 'older two', 'older three'], '2026-01-08T08:00:00.000Z');
    await saveEntry(database, '2026-01-09', ['updated one', 'updated two', 'updated three'], '2026-01-09T09:00:00.000Z');

    expect(await getEntry(database, '2026-01-09')).toMatchObject({
      date: '2026-01-09',
      items: ['updated one', 'updated two', 'updated three'],
    });
    expect((await listEntries(database)).map((entry) => entry.date)).toEqual([
      '2026-01-09',
      '2026-01-08',
    ]);
  });

  it('rejects invalid entries before writing', async () => {
    await expect(saveEntry(new FakeDatabase(), '2026-01-09', ['one', 'two'])).rejects.toThrow(
      'at least three',
    );
  });

  it('preserves the prior entry when replacing it fails', async () => {
    const database = new FakeDatabase();
    await saveEntry(database, '2026-01-09', ['old one', 'old two', 'old three']);
    database.failOnItemPosition = 1;

    await expect(saveEntry(database, '2026-01-09', ['new one', 'new two', 'new three'])).rejects.toThrow(
      'Simulated storage error',
    );
    expect(await getEntry(database, '2026-01-09')).toMatchObject({
      items: ['old one', 'old two', 'old three'],
    });
  });
});
