import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json({ limit: '2mb' }));

// In-memory store for local development only.
const state = {
  enrollments: new Map(),
  scamReports: [],
};

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'voiceguard-api', time: new Date().toISOString() });
});

const EnrollmentSchema = z.object({
  familyMemberName: z.string().min(1),
  relationship: z.string().min(1).optional(),
  phoneNumber: z.string().min(1).optional(),
  // For now we accept a placeholder string (e.g. base64 audio), but we don't process it yet.
  voiceSample: z.string().min(1).optional(),
});

app.post('/enrollments', (req, res) => {
  const parsed = EnrollmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  const id = crypto.randomUUID();
  const record = { id, ...parsed.data, createdAt: new Date().toISOString() };
  state.enrollments.set(id, record);

  return res.status(201).json({ ok: true, enrollment: record });
});

app.get('/enrollments', (req, res) => {
  return res.json({ ok: true, enrollments: Array.from(state.enrollments.values()) });
});

const AnalyzeSchema = z.object({
  claimedIdentity: z.string().min(1).optional(),
  // Placeholder. In a real implementation this would be audio bytes / URL.
  audioSample: z.string().min(1).optional(),
});

app.post('/calls/analyze', (req, res) => {
  const parsed = AnalyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  // Stub logic: always return YELLOW with fixed scores.
  return res.json({
    ok: true,
    result: {
      status: 'YELLOW',
      matchScore: 0.62,
      syntheticProbability: 0.48,
      message: 'Stub analysis (not a real model yet).',
    },
  });
});

const ScamReportSchema = z.object({
  phoneNumber: z.string().min(1),
  claimedIdentity: z.string().min(1).optional(),
  timestamp: z.string().datetime().optional(),
  notes: z.string().min(1).optional(),
});

app.post('/scams/report', (req, res) => {
  const parsed = ScamReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  const report = {
    id: crypto.randomUUID(),
    ...parsed.data,
    timestamp: parsed.data.timestamp ?? new Date().toISOString(),
  };
  state.scamReports.push(report);

  return res.status(201).json({ ok: true, report });
});

app.get('/scams', (req, res) => {
  return res.json({ ok: true, reports: state.scamReports });
});

const port = Number.parseInt(process.env.PORT ?? '8080', 10);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`VoiceGuard API listening on http://localhost:${port}`);
});
