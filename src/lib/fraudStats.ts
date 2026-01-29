export type FraudReportRow = {
  date: string
  country: string
  state?: string
  city?: string
  zip?: string
  age?: number
  sex?: string
  scam_type?: string
  reported_amount_usd?: number
  population?: number
}

export type ParsedStatsData = {
  rows: FraudReportRow[]
  warnings: string[]
}

export type GeoLevel = 'country' | 'state' | 'city' | 'zip'

function asString(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined
  const s = String(v).trim()
  return s.length ? s : undefined
}

function asNumber(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined
  const s = String(v).trim()
  if (!s) return undefined
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

export function normalizeCountry(code?: string): string {
  const c = (code || '').trim().toUpperCase()
  return c || 'UNKNOWN'
}

export function normalizeSex(sex?: string): string {
  const s = (sex || '').trim().toUpperCase()
  if (!s) return 'UNKNOWN'
  if (s === 'M' || s === 'MALE') return 'M'
  if (s === 'F' || s === 'FEMALE') return 'F'
  if (s === 'X' || s === 'OTHER' || s === 'NON-BINARY' || s === 'NONBINARY') return 'OTHER'
  return 'UNKNOWN'
}

export function normalizeScamType(s?: string): string {
  const v = (s || '').trim()
  return v.length ? v : 'Unknown'
}

export function ageBucket(age?: number): string {
  if (age === undefined) return 'Unknown'
  if (age < 18) return '<18'
  if (age <= 24) return '18–24'
  if (age <= 34) return '25–34'
  if (age <= 44) return '35–44'
  if (age <= 54) return '45–54'
  if (age <= 64) return '55–64'
  return '65+'
}

export function monthKey(isoDate: string | undefined): string {
  if (!isoDate) return 'Unknown'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return 'Unknown'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function pickGeoKey(row: FraudReportRow, level: GeoLevel): string {
  switch (level) {
    case 'country':
      return normalizeCountry(row.country)
    case 'state':
      return row.state?.trim() || 'Unknown'
    case 'city':
      return row.city?.trim() || 'Unknown'
    case 'zip':
      return row.zip?.trim() || 'Unknown'
    default:
      return 'Unknown'
  }
}

export function filterRows(
  rows: FraudReportRow[],
  filters: {
    country?: string
    state?: string
    city?: string
    zip?: string
    scamType?: string
  }
): FraudReportRow[] {
  const country = filters.country ? normalizeCountry(filters.country) : undefined
  const state = filters.state?.trim() || undefined
  const city = filters.city?.trim() || undefined
  const zip = filters.zip?.trim() || undefined
  const scamType = filters.scamType?.trim() || undefined

  return rows.filter((r) => {
    if (country && normalizeCountry(r.country) !== country) return false
    if (state && (r.state?.trim() || '') !== state) return false
    if (city && (r.city?.trim() || '') !== city) return false
    if (zip && (r.zip?.trim() || '') !== zip) return false
    if (scamType && normalizeScamType(r.scam_type) !== scamType) return false
    return true
  })
}

export function uniqueValues(rows: FraudReportRow[], pick: (r: FraudReportRow) => string | undefined): string[] {
  const s = new Set<string>()
  for (const r of rows) {
    const v = pick(r)
    if (v) s.add(v)
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b))
}

export function groupCounts(rows: FraudReportRow[], pickKey: (r: FraudReportRow) => string): Array<{ name: string; count: number }> {
  const map = new Map<string, number>()
  for (const r of rows) {
    const k = pickKey(r)
    map.set(k, (map.get(k) || 0) + 1)
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function groupCountsByMonth(rows: FraudReportRow[]): Array<{ month: string; count: number }> {
  const map = new Map<string, number>()
  for (const r of rows) {
    const k = monthKey(r.date)
    map.set(k, (map.get(k) || 0) + 1)
  }
  return Array.from(map.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export function groupByAgeAndSex(rows: FraudReportRow[]): Array<{ bucket: string; M: number; F: number; OTHER: number; UNKNOWN: number }> {
  const buckets = ['<18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+', 'Unknown']
  const map = new Map<string, { M: number; F: number; OTHER: number; UNKNOWN: number }>()
  for (const b of buckets) map.set(b, { M: 0, F: 0, OTHER: 0, UNKNOWN: 0 })

  for (const r of rows) {
    const bucket = ageBucket(r.age)
    const sex = normalizeSex(r.sex)
    const current = map.get(bucket) || { M: 0, F: 0, OTHER: 0, UNKNOWN: 0 }
    current[sex as 'M' | 'F' | 'OTHER' | 'UNKNOWN'] += 1
    map.set(bucket, current)
  }

  return buckets.map((b) => ({ bucket: b, ...(map.get(b) || { M: 0, F: 0, OTHER: 0, UNKNOWN: 0 }) }))
}

export function groupScamTypes(rows: FraudReportRow[], topN = 8): Array<{ name: string; count: number }> {
  const grouped = groupCounts(rows, (r) => normalizeScamType(r.scam_type))
  const top = grouped.slice(0, topN)
  const rest = grouped.slice(topN)
  const restCount = rest.reduce((acc, r) => acc + r.count, 0)
  return restCount > 0 ? [...top, { name: 'Other', count: restCount }] : top
}

export function perCapitaByGeo(
  rows: FraudReportRow[],
  level: GeoLevel,
  per = 100000
): Array<{ name: string; count: number; population?: number; perCapita?: number }> {
  const counts = new Map<string, number>()
  const populations = new Map<string, number>()

  for (const r of rows) {
    const key = pickGeoKey(r, level)
    counts.set(key, (counts.get(key) || 0) + 1)

    const pop = r.population
    if (pop && Number.isFinite(pop) && pop > 0) {
      populations.set(key, Math.max(populations.get(key) || 0, pop))
    }
  }

  return Array.from(counts.entries())
    .map(([name, count]) => {
      const pop = populations.get(name)
      return {
        name,
        count,
        population: pop,
        perCapita: pop ? (count / pop) * per : undefined,
      }
    })
    .sort((a, b) => (b.perCapita ?? -1) - (a.perCapita ?? -1))
}

export function coerceRow(input: Record<string, unknown>): FraudReportRow {
  return {
    date: asString(input.date) || '',
    country: normalizeCountry(asString(input.country)),
    state: asString(input.state),
    city: asString(input.city),
    zip: asString(input.zip),
    age: asNumber(input.age),
    sex: asString(input.sex),
    scam_type: asString(input.scam_type),
    reported_amount_usd: asNumber(input.reported_amount_usd),
    population: asNumber(input.population),
  }
}
