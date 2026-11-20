export const MINIMUM_ITEMS = 3;

export type JournalEntry = {
  date: string;
  items: string[];
  createdAt: string;
  updatedAt: string;
};

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function cleanItems(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}

export function validateItems(items: string[]): string | null {
  if (cleanItems(items).length < MINIMUM_ITEMS) {
    return `Add at least ${MINIMUM_ITEMS} non-empty items.`;
  }
  return null;
}
