import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { localDateKey, validateItems } from '../journal';
import { getEntry, saveEntry } from '../journalRepository';

export default function TodayScreen() {
  const database = useSQLiteContext();
  const [today, setToday] = useState(() => localDateKey());
  const [draftDate, setDraftDate] = useState(today);
  const [items, setItems] = useState(['', '', '']);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState('');
  const [loadedDate, setLoadedDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const selectedDate = dirty ? draftDate : today;

  useEffect(() => {
    const refreshDate = () => setToday(localDateKey());
    const interval = setInterval(refreshDate, 60_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshDate();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let active = true;
    getEntry(database, selectedDate)
      .then((entry) => {
        if (active) {
          setItems(entry?.items ?? ['', '', '']);
          setLoadedDate(selectedDate);
        }
      })
      .catch(() => {
        if (active) setStorageError('Unable to open local journal storage. Please restart the app and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [database, selectedDate]);

  function markDirty(): boolean {
    const currentDate = localDateKey();
    if (!dirty && today !== currentDate) {
      setToday(currentDate);
      return false;
    }
    if (!dirty) setDraftDate(today);
    setDirty(true);
    return true;
  }

  async function saveToday() {
    const currentDate = localDateKey();
    if (!dirty && today !== currentDate) {
      setToday(currentDate);
      return;
    }
    const entryDate = dirty ? draftDate : currentDate;
    setToday(currentDate);
    const error = validateItems(items);
    if (error) {
      setMessage(error);
      return;
    }
    setSaving(true);
    try {
      await saveEntry(database, entryDate, items);
      setMessage(`Saved on this device for ${entryDate}.`);
      setDirty(false);
    } catch {
      setMessage('Unable to save this entry. Your previous saved entry was preserved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || (!storageError && loadedDate !== selectedDate)) {
    return <ActivityIndicator style={styles.centered} />;
  }

  if (storageError) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.title}>Journal unavailable</Text>
        <Text>{storageError}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Today: {selectedDate}</Text>
          <Link href="/history" style={styles.link}>History</Link>
        </View>
        {selectedDate !== today && (
          <Text>Your draft stays assigned to {selectedDate}; save it before starting a new day.</Text>
        )}
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <TextInput
              accessibilityLabel={`Good thing ${index + 1}`}
              value={item}
              editable={!saving}
              onChangeText={(text) => {
                if (!markDirty()) return;
                setItems((current) => current.map((value, i) => (i === index ? text : value)));
              }}
              placeholder={`Good thing ${index + 1}`}
              style={styles.input}
            />
            {index >= 3 && (
              <Button
                title="Remove"
                accessibilityLabel={`Remove good thing ${index + 1}`}
                disabled={saving}
                onPress={() => {
                  if (!markDirty()) return;
                  setItems((current) => current.filter((_, i) => i !== index));
                }}
              />
            )}
          </View>
        ))}
        <Button
          title="Add another"
          disabled={saving}
          onPress={() => {
            if (!markDirty()) return;
            setItems((current) => [...current, '']);
          }}
        />
        <Button title="Save today's entry" disabled={saving} onPress={saveToday} />
        {!!message && <Text style={styles.message}>{message}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1 },
  screen: { flex: 1, padding: 20 },
  container: { flexGrow: 1, gap: 12 },
  header: { gap: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: '700' },
  input: { flex: 1, borderColor: '#999', borderRadius: 6, borderWidth: 1, padding: 12 },
  message: { marginTop: 8 },
  link: { color: '#155eef', fontSize: 16 },
});
