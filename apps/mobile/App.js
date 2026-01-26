import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  const apiBaseUrl = useMemo(() => {
    return process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
  }, []);

  const [healthJson, setHealthJson] = useState(null);
  const [analyzeJson, setAnalyzeJson] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function callJson(path, options) {
    const url = `${apiBaseUrl}${path}`;
    const res = await fetch(url, {
      headers: { 'content-type': 'application/json' },
      ...options,
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Non-JSON response (${res.status}): ${text}`);
    }
  }

  async function onHealth() {
    setLoading(true);
    setError(null);
    try {
      const json = await callJson('/health', { method: 'GET' });
      setHealthJson(json);
    } catch (e) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  async function onAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const json = await callJson('/calls/analyze', {
        method: 'POST',
        body: JSON.stringify({ claimedIdentity: 'John', audioSample: 'stub' }),
      });
      setAnalyzeJson(json);
    } catch (e) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>VoiceGuard (Preview)</Text>

        <Text style={styles.label}>API Base URL</Text>
        <Text style={styles.mono}>{apiBaseUrl}</Text>

        <View style={styles.row}>
          <Button title={loading ? 'Loading…' : 'Check /health'} onPress={onHealth} disabled={loading} />
        </View>
        <View style={styles.row}>
          <Button title={loading ? 'Loading…' : 'Analyze call (stub)'} onPress={onAnalyze} disabled={loading} />
        </View>

        {error ? (
          <View style={styles.block}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.mono}>{error}</Text>
          </View>
        ) : null}

        {healthJson ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>/health</Text>
            <Text style={styles.mono}>{JSON.stringify(healthJson, null, 2)}</Text>
          </View>
        ) : null}

        {analyzeJson ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>/calls/analyze</Text>
            <Text style={styles.mono}>{JSON.stringify(analyzeJson, null, 2)}</Text>
          </View>
        ) : null}
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '600' },
  mono: { fontFamily: 'Menlo', fontSize: 12 },
  row: { marginTop: 4 },
  block: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#ddd' },
  blockTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  errorTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6, color: '#b00020' },
});
