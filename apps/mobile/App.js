import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { apiGet, apiPost, getApiBaseUrl } from './src/api';

function PrimaryButton({ title, onPress, disabled, loading }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.primaryButton,
        (disabled || loading) ? styles.primaryButtonDisabled : null,
        pressed && !(disabled || loading) ? styles.primaryButtonPressed : null,
      ]}
    >
      <View style={styles.primaryButtonInner}>
        {loading ? <ActivityIndicator size="small" color="#fff" /> : null}
        <Text style={styles.primaryButtonText}>{title}</Text>
      </View>
    </Pressable>
  );
}

function TabButton({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.tabButton,
        selected ? styles.tabButtonSelected : null,
        pressed ? styles.tabButtonPressed : null,
      ]}
    >
      <Text style={[styles.tabButtonText, selected ? styles.tabButtonTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

function getStatusTheme(status) {
  switch (status) {
    case 'GREEN':
      return {
        label: 'Verified',
        description: 'Safe to answer.',
        borderColor: '#2e7d32',
        backgroundColor: '#e8f5e9',
      };
    case 'YELLOW':
      return {
        label: 'Suspicious',
        description: 'Proceed with caution.',
        borderColor: '#f9a825',
        backgroundColor: '#fff8e1',
      };
    case 'RED':
      return {
        label: 'Blocked',
        description: 'Likely synthetic voice.',
        borderColor: '#c62828',
        backgroundColor: '#ffebee',
      };
    default:
      return {
        label: 'Unknown',
        description: 'No status provided.',
        borderColor: '#666',
        backgroundColor: '#f5f5f5',
      };
  }
}

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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.title}>VoiceGuard</Text>
              <Text style={styles.subtitle}>Preview UI for Verify, Enroll, and Report flows</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Connection</Text>
              <Text style={styles.helper}>API Base URL</Text>
              <View style={styles.pill}>
                <Text style={styles.mono} selectable>
                  {apiBaseUrl}
                </Text>
              </View>
              <PrimaryButton title="Check /health" onPress={onHealth} disabled={false} loading={loading} />
              {healthJson ? (
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>/health response</Text>
                  <Text style={styles.mono} selectable>
                    {JSON.stringify(healthJson, null, 2)}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.tabs}>
              <TabButton label="Verify" selected={tab === 'verify'} onPress={() => setTab('verify')} />
              <TabButton label="Enroll" selected={tab === 'enroll'} onPress={() => setTab('enroll')} />
              <TabButton label="Report" selected={tab === 'report'} onPress={() => setTab('report')} />
            </View>

            {error ? (
              <View style={[styles.card, styles.errorCard]}>
                <Text style={styles.errorTitle}>Something went wrong</Text>
                <Text style={styles.mono} selectable>
                  {error}
                </Text>
              </View>
            ) : null}

            {tab === 'verify' ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Incoming Call Verification</Text>
                <Text style={styles.helper}>This is currently stubbed (audioSample: "stub").</Text>

                <Text style={styles.label}>Claimed identity</Text>
                <TextInput
                  value={verifyClaimedIdentity}
                  onChangeText={setVerifyClaimedIdentity}
                  placeholder="e.g. John"
                  autoCapitalize="words"
                  style={styles.input}
                  returnKeyType="done"
                />

                <PrimaryButton title="Analyze" onPress={onVerify} disabled={false} loading={loading} />

                {verifyResult ? (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Result</Text>
                    {verifyResult?.result?.status ? (
                      <View
                        style={[
                          styles.statusCard,
                          {
                            borderColor: getStatusTheme(verifyResult.result.status).borderColor,
                            backgroundColor: getStatusTheme(verifyResult.result.status).backgroundColor,
                          },
                        ]}
                      >
                        <Text style={styles.statusTitle}>
                          {getStatusTheme(verifyResult.result.status).label}
                          <Text style={styles.statusTitleMuted}>  ·  {verifyResult.result.status}</Text>
                        </Text>
                        <Text style={styles.statusDescription}>
                          {verifyResult.result.message || getStatusTheme(verifyResult.result.status).description}
                        </Text>
                        <Text style={styles.statusMeta}>
                          Match score:{' '}
                          {typeof verifyResult.result.matchScore === 'number' ? verifyResult.result.matchScore : '—'}
                          {'  '}|{'  '}Synthetic probability:{' '}
                          {typeof verifyResult.result.syntheticProbability === 'number'
                            ? verifyResult.result.syntheticProbability
                            : '—'}
                        </Text>
                      </View>
                    ) : null}

                    <Text style={styles.mono} selectable>
                      {JSON.stringify(verifyResult, null, 2)}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {tab === 'enroll' ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Voice Enrollment</Text>
                <Text style={styles.helper}>Required fields are marked with *.</Text>

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

                <PrimaryButton
                  title="Create enrollment"
                  onPress={onEnroll}
                  disabled={!enrollName.trim()}
                  loading={loading}
                />

                {enrollResult ? (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Enrollment created</Text>
                    <Text style={styles.mono} selectable>
                      {JSON.stringify(enrollResult, null, 2)}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {tab === 'report' ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Scam Reporting</Text>
                <Text style={styles.helper}>Help protect others by reporting suspicious numbers.</Text>

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

                <PrimaryButton
                  title="Submit report"
                  onPress={onReport}
                  disabled={!reportPhone.trim()}
                  loading={loading}
                />

                {reportResult ? (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Report submitted</Text>
                    <Text style={styles.mono} selectable>
                      {JSON.stringify(reportResult, null, 2)}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <View style={styles.footerSpace} />
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  keyboardAvoid: { flex: 1 },
  container: { padding: 16, paddingBottom: 24, gap: 12 },
  header: { gap: 4, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, color: '#666' },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonSelected: { backgroundColor: '#fff' },
  tabButtonPressed: { opacity: 0.85 },
  tabButtonText: { fontSize: 14, fontWeight: '700', color: '#666' },
  tabButtonTextSelected: { color: '#333' },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#333' },
  label: { fontSize: 13, fontWeight: '700', color: '#333' },
  helper: { fontSize: 13, color: '#666' },
  pill: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 12,
    color: '#333',
  },
  resultCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  resultTitle: { fontSize: 13, fontWeight: '800', color: '#333' },

  errorCard: { borderColor: '#b00020' },
  errorTitle: { fontSize: 14, fontWeight: '800', color: '#b00020' },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },

  primaryButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonInner: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  primaryButtonPressed: { opacity: 0.9 },
  primaryButtonDisabled: { opacity: 0.55 },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  statusCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  statusTitle: { fontSize: 16, fontWeight: '900', marginBottom: 6, color: '#333' },
  statusTitleMuted: { fontSize: 14, fontWeight: '800', color: '#666' },
  statusDescription: { fontSize: 14, marginBottom: 8, color: '#333' },
  statusMeta: { fontSize: 12, color: '#333' },
  footerSpace: { height: 8 },
});
