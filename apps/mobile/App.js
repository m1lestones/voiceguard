import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { apiGet, apiPost, getApiBaseUrl } from './src/api';

export default function App() {
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  const [tab, setTab] = useState('verify');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [healthJson, setHealthJson] = useState(null);
  const [verifyClaimedIdentity, setVerifyClaimedIdentity] = useState('John');
  const [verifyResult, setVerifyResult] = useState(null);

  const [enrollName, setEnrollName] = useState('');
  const [enrollRelationship, setEnrollRelationship] = useState('');
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollResult, setEnrollResult] = useState(null);

  const [reportPhone, setReportPhone] = useState('');
  const [reportClaimed, setReportClaimed] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  const [reportResult, setReportResult] = useState(null);

  async function onHealth() {
    setLoading(true);
    setError(null);
    try {
      const json = await apiGet('/health');
      setHealthJson(json);
    } catch (e) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  async function onVerify() {
    setLoading(true);
    setError(null);
    try {
      const json = await apiPost('/calls/analyze', {
        claimedIdentity: verifyClaimedIdentity || undefined,
        audioSample: 'stub',
      });
      setVerifyResult(json);
    } catch (e) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  async function onEnroll() {
    setLoading(true);
    setError(null);
    try {
      const json = await apiPost('/enrollments', {
        familyMemberName: enrollName,
        relationship: enrollRelationship || undefined,
        phoneNumber: enrollPhone || undefined,
        voiceSample: 'stub',
      });
      setEnrollResult(json);
      setEnrollName('');
      setEnrollRelationship('');
      setEnrollPhone('');
    } catch (e) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  async function onReport() {
    setLoading(true);
    setError(null);
    try {
      const json = await apiPost('/scams/report', {
        phoneNumber: reportPhone,
        claimedIdentity: reportClaimed || undefined,
        notes: reportNotes || undefined,
      });
      setReportResult(json);
      setReportPhone('');
      setReportClaimed('');
      setReportNotes('');
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

        <View style={styles.tabs}>
          <Button title="Verify" onPress={() => setTab('verify')} />
          <Button title="Enroll" onPress={() => setTab('enroll')} />
          <Button title="Report" onPress={() => setTab('report')} />
        </View>

        <View style={styles.row}>
          <Button title={loading ? 'Loading…' : 'Check /health'} onPress={onHealth} disabled={loading} />
        </View>

        {tab === 'verify' ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Incoming Call Verification (Stub)</Text>
            <Text style={styles.label}>Claimed identity</Text>
            <TextInput
              value={verifyClaimedIdentity}
              onChangeText={setVerifyClaimedIdentity}
              placeholder="e.g. John"
              autoCapitalize="words"
              style={styles.input}
            />
            <View style={styles.row}>
              <Button title={loading ? 'Loading…' : 'Analyze'} onPress={onVerify} disabled={loading} />
            </View>
            {verifyResult ? (
              <View style={styles.result}>
                <Text style={styles.mono}>{JSON.stringify(verifyResult, null, 2)}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {tab === 'enroll' ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Voice Enrollment (Stub)</Text>
            <Text style={styles.label}>Family member name *</Text>
            <TextInput
              value={enrollName}
              onChangeText={setEnrollName}
              placeholder="e.g. Maria"
              autoCapitalize="words"
              style={styles.input}
            />
            <Text style={styles.label}>Relationship</Text>
            <TextInput
              value={enrollRelationship}
              onChangeText={setEnrollRelationship}
              placeholder="e.g. Mom"
              autoCapitalize="words"
              style={styles.input}
            />
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              value={enrollPhone}
              onChangeText={setEnrollPhone}
              placeholder="e.g. +1 555 555 5555"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <View style={styles.row}>
              <Button
                title={loading ? 'Loading…' : 'Create enrollment'}
                onPress={onEnroll}
                disabled={loading || !enrollName.trim()}
              />
            </View>
            {enrollResult ? (
              <View style={styles.result}>
                <Text style={styles.mono}>{JSON.stringify(enrollResult, null, 2)}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {tab === 'report' ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Scam Reporting (Stub)</Text>
            <Text style={styles.label}>Phone number *</Text>
            <TextInput
              value={reportPhone}
              onChangeText={setReportPhone}
              placeholder="e.g. +1 555 555 5555"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <Text style={styles.label}>Caller claimed to be</Text>
            <TextInput
              value={reportClaimed}
              onChangeText={setReportClaimed}
              placeholder="e.g. John"
              autoCapitalize="words"
              style={styles.input}
            />
            <Text style={styles.label}>Notes</Text>
            <TextInput
              value={reportNotes}
              onChangeText={setReportNotes}
              placeholder="Optional notes"
              multiline
              style={[styles.input, styles.textarea]}
            />
            <View style={styles.row}>
              <Button
                title={loading ? 'Loading…' : 'Submit report'}
                onPress={onReport}
                disabled={loading || !reportPhone.trim()}
              />
            </View>
            {reportResult ? (
              <View style={styles.result}>
                <Text style={styles.mono}>{JSON.stringify(reportResult, null, 2)}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

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
  tabs: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  row: { marginTop: 4 },
  block: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#ddd' },
  blockTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  errorTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6, color: '#b00020' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    marginTop: 6,
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  result: { marginTop: 10 },
});
