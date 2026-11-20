import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeJournalDatabase } from '../journalRepository';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="three-a-day.db" onInit={initializeJournalDatabase}>
      <Stack screenOptions={{ headerShown: false }} />
    </SQLiteProvider>
  );
}
