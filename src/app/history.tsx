import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text } from 'react-native';
import type { JournalEntry } from '../journal';
import { listEntries } from '../journalRepository';

export default function HistoryScreen() {
  const database = useSQLiteContext();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listEntries(database)
      .then((savedEntries) => {
        if (active) setEntries(savedEntries);
      })
      .catch(() => {
        if (active) setError('Unable to load journal history.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [database]);

  return (
    <SafeAreaView style={styles.container}>
      <Link href="/" replace style={styles.link}>Today</Link>
      <Text style={styles.title}>Journal history</Text>
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(entry) => entry.date}
          ListEmptyComponent={<Text>No saved entries yet.</Text>}
          renderItem={({ item }) => (
            <Link href={{ pathname: '/entry/[date]', params: { date: item.date } }} style={styles.link}>
              {`${item.date} (${item.items.length} items)`}
            </Link>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  link: { color: '#155eef', paddingVertical: 8 },
});
