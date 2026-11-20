import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import type { JournalEntry } from '../../journal';
import { getEntry } from '../../journalRepository';

export default function EntryScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!date) return;
    let active = true;
    getEntry(database, date)
      .then((savedEntry) => {
        if (active) {
          setEntry(savedEntry);
          if (!savedEntry) setError('This journal entry could not be found.');
        }
      })
      .catch(() => {
        if (active) setError('Unable to load this journal entry.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [database, date]);

  return (
    <SafeAreaView style={styles.screen}>
      <Button title="Back to history" onPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        {!date ? (
          <Text>Entry date is missing.</Text>
        ) : loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text>{error}</Text>
        ) : entry ? (
          <>
            <Text style={styles.title}>{entry.date}</Text>
            {entry.items.map((item, index) => (
              <Text key={`${entry.date}-${index}`} style={styles.item}>
                {index + 1}. {item}
              </Text>
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  container: { flexGrow: 1, gap: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  item: { fontSize: 18, paddingVertical: 8 },
});
