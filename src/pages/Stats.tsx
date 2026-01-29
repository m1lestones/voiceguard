import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import { Link } from 'react-router-dom'
import Papa from 'papaparse'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  type FraudReportRow,
  type GeoLevel,
  coerceRow,
  filterRows,
  groupByAgeAndSex,
  groupCounts,
  groupCountsByMonth,
  groupScamTypes,
  normalizeCountry,
  normalizeScamType,
  perCapitaByGeo,
  uniqueValues,
} from '../lib/fraudStats'

const COLORS = ['#36d7cc', '#a78bfa', '#f59e0b', '#ef4444', '#22c55e', '#60a5fa', '#f472b6', '#94a3b8']

type DataMode = 'demo' | 'upload' | 'official'

const CSV_COLUMNS = [
  'date',
  'country',
  'state',
  'city',
  'zip',
  'age',
  'sex',
  'scam_type',
  'reported_amount_usd',
  'population',
] as const

function truncateLabel(input: unknown, max = 12): string {
  const s = String(input ?? '')
  if (s.length <= max) return s
  return `${s.slice(0, Math.max(0, max - 1))}…`
}

export function Stats() {
  const [mode, setMode] = useState<DataMode>('demo')
  const [uploadedRows, setUploadedRows] = useState<FraudReportRow[] | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [country, setCountry] = useState<string>('US')
  const [state, setState] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [zip, setZip] = useState<string>('')
  const [scamType, setScamType] = useState<string>('')
  const [geoLevel, setGeoLevel] = useState<GeoLevel>('state')
  const [normalizePerCapita, setNormalizePerCapita] = useState(true)

  const [demoRows, setDemoRows] = useState<FraudReportRow[] | null>(null)

  useEffect(() => {
    if (mode !== 'demo') return
    if (demoRows) return
    let cancelled = false
    fetch('/sample-fraud-reports.csv')
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return
        const parsed = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true })
        const next: FraudReportRow[] = []
        for (const row of parsed.data) next.push(coerceRow(row))
        setDemoRows(next)
      })
      .catch(() => {
        if (cancelled) return
        setDemoRows([])
      })
    return () => {
      cancelled = true
    }
  }, [mode, demoRows])

  const effectiveRows = useMemo(() => {
    if (mode === 'upload') return uploadedRows || []
    if (mode === 'official') return []
    return demoRows || []
  }, [mode, uploadedRows, demoRows])

  const filtered = useMemo(() => {
    return filterRows(effectiveRows, {
      country,
      state: state || undefined,
      city: city || undefined,
      zip: zip || undefined,
      scamType: scamType || undefined,
    })
  }, [effectiveRows, country, state, city, zip, scamType])

  const isEmbeddedOfficial = mode === 'official'

  const countries = useMemo(() => uniqueValues(effectiveRows, (r) => normalizeCountry(r.country)), [effectiveRows])

  const states = useMemo(() => {
    const base = filterRows(effectiveRows, { country })
    return uniqueValues(base, (r) => r.state)
  }, [effectiveRows, country])

  const cities = useMemo(() => {
    const base = filterRows(effectiveRows, { country, state: state || undefined })
    return uniqueValues(base, (r) => r.city)
  }, [effectiveRows, country, state])

  const zips = useMemo(() => {
    const base = filterRows(effectiveRows, { country, state: state || undefined, city: city || undefined })
    return uniqueValues(base, (r) => r.zip)
  }, [effectiveRows, country, state, city])

  const scamTypes = useMemo(() => {
    const base = filterRows(effectiveRows, { country })
    return uniqueValues(base, (r) => normalizeScamType(r.scam_type))
  }, [effectiveRows, country])

  const monthly = useMemo(() => groupCountsByMonth(filtered), [filtered])

  const topAreas = useMemo(() => {
    const level: GeoLevel = geoLevel
    const items = groupCounts(filtered, (r) => {
      if (level === 'country') return normalizeCountry(r.country)
      if (level === 'state') return r.state?.trim() || 'Unknown'
      if (level === 'city') return r.city?.trim() || 'Unknown'
      return r.zip?.trim() || 'Unknown'
    })
    return items.slice(0, 12)
  }, [filtered, geoLevel])

  const ageSex = useMemo(() => groupByAgeAndSex(filtered), [filtered])
  const scamTypeBreakdown = useMemo(() => groupScamTypes(filtered, 7), [filtered])

  const perCapita = useMemo(() => {
    if (!normalizePerCapita) return []
    // Per-capita is most meaningful at state level, but we support any geo with population values.
    return perCapitaByGeo(filtered, geoLevel, 100000).filter((r) => r.perCapita !== undefined).slice(0, 12)
  }, [filtered, geoLevel, normalizePerCapita])

  const hasAnyPopulation = useMemo(() => filtered.some((r) => !!r.population && r.population > 0), [filtered])

  const handleUpload = async (file: File) => {
    setUploadError(null)
    setUploadedRows(null)

    const text = await file.text()
    const parsed = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true })
    if (parsed.errors?.length) {
      setUploadError(parsed.errors[0]?.message || 'Failed to parse CSV')
      return
    }

    const next: FraudReportRow[] = []
    for (const r of parsed.data) next.push(coerceRow(r))
    setUploadedRows(next)

    const inferredCountry = uniqueValues(next, (row) => normalizeCountry(row.country))[0]
    if (inferredCountry) setCountry(inferredCountry)
    setState('')
    setCity('')
    setZip('')
    setScamType('')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.6rem' }}>Fraud Stats</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>
          {isEmbeddedOfficial ? (
            <span>
              Source: <strong style={{ color: 'var(--text)' }}>FTC (Tableau Public)</strong>
            </span>
          ) : (
            <span>
              Showing <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> reports
            </span>
          )}
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
        Explore fraud trends by region (country → state → city → ZIP), scam type, and demographics. Use Official mode for fast, free U.S. stats.
      </p>

      <section style={cardStyle}>
        <h2 style={cardTitle}>Data</h2>
        <div style={{ display: 'grid', gap: '.6rem' }}>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setMode('demo')}
              className={`vg-pill ${mode === 'demo' ? 'vg-pill--active' : ''}`}
              style={mode === 'demo' ? pillActive : pill}
              type="button"
            >
              Demo data
            </button>
            <button
              onClick={() => setMode('official')}
              className={`vg-pill ${mode === 'official' ? 'vg-pill--active' : ''}`}
              style={mode === 'official' ? pillActive : pill}
              type="button"
            >
              Official (free)
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`vg-pill ${mode === 'upload' ? 'vg-pill--active' : ''}`}
              style={mode === 'upload' ? pillActive : pill}
              type="button"
            >
              Upload CSV
            </button>
            <a
              href="/sample-fraud-reports.csv"
              target="_blank"
              rel="noreferrer"
              className="vg-pill"
              style={{ ...pill, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Download sample CSV
            </a>
          </div>

          <div style={helpTextStyle}>
            <div style={{ marginBottom: '.25rem' }}>CSV columns (header row):</div>
            <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
              {CSV_COLUMNS.join(', ')}
            </div>
            <div style={{ marginTop: '.25rem' }}>
              <strong style={{ color: 'var(--text)' }}>population</strong> is optional — include it to enable per-capita charts.
            </div>
          </div>

          {mode === 'upload' && (
            <div style={{ display: 'grid', gap: '.5rem' }}>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  handleUpload(f)
                }}
              />
              {uploadError && <div style={{ color: 'var(--danger)', fontSize: '.9rem' }}>{uploadError}</div>}
              {!uploadError && uploadedRows && (
                <div style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>
                  Loaded <strong style={{ color: 'var(--text)' }}>{uploadedRows.length}</strong> rows.
                </div>
              )}
            </div>
          )}

          <div style={helpTextStyle}>
            <div style={{ marginBottom: '.25rem' }}>Per-capita charts:</div>
            <div>
              Include a <strong style={{ color: 'var(--text)' }}>population</strong> value per region (state/city/ZIP) to enable per-capita views.
            </div>
          </div>

          {mode === 'official' && (
            <div style={helpTextStyle}>
              <div style={{ marginBottom: '.25rem' }}>Official mode:</div>
              <div>Embeds FTC dashboards from Tableau Public (no API key).</div>
              <div style={{ marginTop: '.25rem' }}>
                For the most detail (age, state, metro), use the filters inside each dashboard.
              </div>
            </div>
          )}
        </div>
      </section>

      {mode === 'official' && (
        <>
          <section style={cardStyle}>
            <h2 style={cardTitle}>USA — Fraud reports by state</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginTop: '.35rem' }}>
              Official FTC Consumer Sentinel Network visualizations.
            </div>
            <div style={{ height: 520, marginTop: '.75rem' }}>
              <iframe
                title="FTC Fraud Reports — State subcategories"
                src="https://public.tableau.com/views/FraudReports/StateSubcategories?:showVizHome=no&:embed=yes"
                style={{ width: '100%', height: '100%', border: '1px solid var(--border)', borderRadius: 14, background: 'rgba(255,255,255,0.02)' }}
              />
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={cardTitle}>USA — Age × state (loss rate and median loss)</h2>
            <div style={{ height: 520, marginTop: '.75rem' }}>
              <iframe
                title="FTC Fraud Reports — Age and state"
                src="https://public.tableau.com/views/FraudReports/AgeState?:showVizHome=no&:embed=yes"
                style={{ width: '100%', height: '100%', border: '1px solid var(--border)', borderRadius: 14, background: 'rgba(255,255,255,0.02)' }}
              />
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={cardTitle}>International travel — cross-border reports</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginTop: '.35rem' }}>
              Based on international reports to econsumer.gov.
            </div>
            <div style={{ height: 520, marginTop: '.75rem' }}>
              <iframe
                title="FTC eConsumer — International reports infographic"
                src="https://public.tableau.com/views/eConsumer/Infographic?:showVizHome=no&:embed=yes"
                style={{ width: '100%', height: '100%', border: '1px solid var(--border)', borderRadius: 14, background: 'rgba(255,255,255,0.02)' }}
              />
            </div>
          </section>

          <section style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(54,215,204,0.10))' }}>
            <h2 style={cardTitle}>Note</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '.95rem' }}>
              ZIP-level and city-level demographic breakdowns usually aren\'t published in open official datasets. If you want that level of detail, the fastest approach is to upload or connect your own dataset.
            </p>
            <div style={{ marginTop: '.75rem', color: 'var(--text-muted)', fontSize: '.9rem' }}>
              Related: <Link to="/fraud-101">Fraud 101</Link> • <Link to="/">Home</Link>
            </div>
          </section>
        </>
      )}

      {mode !== 'official' && (
        <>

      <section style={cardStyle}>
        <h2 style={cardTitle}>Filters</h2>
        <div style={{ display: 'grid', gap: '.75rem' }}>
          <div style={{ display: 'grid', gap: '.5rem' }}>
            <label style={labelStyle}>Country</label>
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value)
                setState('')
                setCity('')
                setZip('')
              }}
              style={selectStyle}
            >
              {(countries.length ? countries : ['US']).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: '.5rem' }}>
            <label style={labelStyle}>Geography level</label>
            <select
              value={geoLevel}
              onChange={(e) => setGeoLevel(e.target.value as GeoLevel)}
              style={selectStyle}
            >
              <option value="state">State/Province</option>
              <option value="city">City</option>
              <option value="zip">ZIP / Postal</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
            <div style={{ display: 'grid', gap: '.5rem' }}>
              <label style={labelStyle}>State/Province</label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value)
                  setCity('')
                  setZip('')
                }}
                style={selectStyle}
              >
                <option value="">All</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gap: '.5rem' }}>
              <label style={labelStyle}>Scam type</label>
              <select value={scamType} onChange={(e) => setScamType(e.target.value)} style={selectStyle}>
                <option value="">All</option>
                {scamTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
            <div style={{ display: 'grid', gap: '.5rem' }}>
              <label style={labelStyle}>City</label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value)
                  setZip('')
                }}
                style={selectStyle}
              >
                <option value="">All</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gap: '.5rem' }}>
              <label style={labelStyle}>ZIP / Postal</label>
              <select value={zip} onChange={(e) => setZip(e.target.value)} style={selectStyle}>
                <option value="">All</option>
                {zips.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '.9rem' }}>
            <input
              type="checkbox"
              checked={normalizePerCapita}
              onChange={(e) => setNormalizePerCapita(e.target.checked)}
            />
            Show per-capita rates (per 100k) when population is available
          </label>

          {normalizePerCapita && !hasAnyPopulation && (
            <div style={{ color: 'var(--warn)', fontSize: '.9rem' }}>
              No population values found in the filtered data — per-capita charts will be hidden.
            </div>
          )}
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={cardTitle}>Reports over time</h2>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly} margin={{ left: 8, right: 12, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} tickMargin={10} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#36d7cc" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={cardTitle}>Top areas ({geoLevel})</h2>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topAreas} margin={{ left: 8, right: 12, top: 10, bottom: 55 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
                tickMargin={12}
                tickFormatter={(v) => truncateLabel(v, 14)}
              />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#a78bfa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {normalizePerCapita && perCapita.length > 0 && (
        <section style={cardStyle}>
          <h2 style={cardTitle}>Top per-capita rates (per 100k)</h2>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perCapita} margin={{ left: 8, right: 12, top: 10, bottom: 55 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                  tickMargin={12}
                  tickFormatter={(v) => truncateLabel(v, 14)}
                />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: any, name: any) => {
                    if (name === 'perCapita') return [Number(value).toFixed(2), 'per 100k']
                    if (name === 'count') return [String(value), 'reports']
                    return [String(value), String(name)]
                  }}
                />
                <Bar dataKey="perCapita" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section style={cardStyle}>
        <h2 style={cardTitle}>Demographics</h2>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageSex} margin={{ left: 8, right: 12, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="bucket" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
              <Bar dataKey="F" stackId="a" fill="#f472b6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="M" stackId="a" fill="#60a5fa" radius={[8, 8, 0, 0]} />
              <Bar dataKey="OTHER" stackId="a" fill="#22c55e" radius={[8, 8, 0, 0]} />
              <Bar dataKey="UNKNOWN" stackId="a" fill="#94a3b8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={cardTitle}>Scam types</h2>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie data={scamTypeBreakdown} dataKey="count" nameKey="name" outerRadius={110} innerRadius={50} paddingAngle={2}>
                {scamTypeBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(54,215,204,0.12), rgba(167,139,250,0.10))' }}>
        <h2 style={cardTitle}>Next: real-world data</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '.95rem' }}>
          To show official counts by U.S. state/city/ZIP, we\'ll need a data source (CSV, API, or warehouse) that includes geography and demographics.
          For now, this page supports CSV upload so you can connect your dataset without changing UI.
        </p>
        <div style={{ marginTop: '.75rem', color: 'var(--text-muted)', fontSize: '.9rem' }}>
          Related: <Link to="/fraud-101">Fraud 101</Link> • <Link to="/">Home</Link>
        </div>
      </section>
        </>
      )}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  marginBottom: '1.25rem',
  padding: '1rem 1.25rem',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  background: 'var(--bg-card)',
  boxShadow: 'var(--shadow-soft)',
}

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '1rem',
}

const labelStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
  fontSize: '.85rem',
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.03)',
  color: 'var(--text)',
  padding: '.55rem .7rem',
}

const pill: React.CSSProperties = {
  borderRadius: 999,
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.02)',
  color: 'var(--text)',
  padding: '.4rem .7rem',
  cursor: 'pointer',
}

const pillActive: React.CSSProperties = {
  ...pill,
  border: '1px solid rgba(54,215,204,0.65)',
  boxShadow: '0 0 0 3px rgba(54,215,204,0.12)',
}

const tooltipStyle: React.CSSProperties = {
  background: 'rgba(14,18,28,0.95)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  color: 'rgba(255,255,255,0.92)',
}

const helpTextStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
  fontSize: '.9rem',
  lineHeight: 1.35,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
}
