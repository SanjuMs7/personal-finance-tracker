import type { SQLiteDatabase } from 'expo-sqlite';

const CURRENT_VERSION = 3;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion >= CURRENT_VERSION) {
    return;
  }

  if (currentVersion < 1) {
    await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      monthly_limit INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      icon TEXT NOT NULL,
      expense_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL DEFAULT 'system',
      currency TEXT NOT NULL DEFAULT 'INR'
    );

    INSERT OR IGNORE INTO settings (id, theme, currency) VALUES (1, 'system', 'INR');
  `);
  }

  if (currentVersion < 2) {
    // The 'other' icon's label became 'Miscellaneous'. Categories still carrying
    // the old auto-filled name follow it; anything the user renamed is left alone.
    await db.runAsync("UPDATE categories SET name = 'Miscellaneous' WHERE icon = 'other' AND name = 'Other'");
  }

  if (currentVersion < 3) {
    // Limits become effective-dated: a row says "from this month on, the limit is
    // X", so browsing an old month shows the limit that was in force back then.
    // categories.monthly_limit stays behind as dead weight — SQLite makes dropping
    // a column costly, and nothing reads it any more.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS category_limits (
        category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        effective_month INTEGER NOT NULL,
        amount INTEGER,
        PRIMARY KEY (category_id, effective_month)
      );
    `);

    // Existing limits are backfilled at month 0 so they apply to all history,
    // which is exactly how they behaved before this change.
    await db.runAsync(
      `INSERT OR IGNORE INTO category_limits (category_id, effective_month, amount)
       SELECT id, 0, monthly_limit FROM categories WHERE monthly_limit IS NOT NULL AND monthly_limit > 0`
    );
  }

  await db.execAsync(`PRAGMA user_version = ${CURRENT_VERSION}`);
}
