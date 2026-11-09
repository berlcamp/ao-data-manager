// Kept separate from officeReportExport so the modal can lazy-load the
// heavy PDF/Excel libraries only when exporting
import { format, parseISO } from 'date-fns'

export interface OfficeReportRow {
  id: number
  title: string
  date: string
  time: string | null
  user: string | null
  adm_trackers: {
    id: number
    routing_slip_no: string | null
    type: string | null
    requester: string | null
    agency: string | null
    amount: string | null
    particulars: string | null
    location: string | null
    status: string | null
  }
}

export interface OfficeReportMeta {
  location: string // original location, e.g. 'Received for Acting Mayor'
  loggedBy: string // '' unless filtered to the current user's logs
  fromDate: string // yyyy-MM-dd
  toDate: string // yyyy-MM-dd
  types: string // 'All' or comma-separated document types
  preparedBy: string
}

export const formatReportDate = (ymd: string) =>
  format(parseISO(ymd), 'MMMM d, yyyy')

export const formatReportPeriod = (meta: OfficeReportMeta) =>
  meta.fromDate === meta.toDate
    ? formatReportDate(meta.fromDate)
    : `${formatReportDate(meta.fromDate)} to ${formatReportDate(meta.toDate)}`

// Route times were saved in mixed formats ('2:05 PM', '14:05', '2:05 p.m.',
// '5;00 PM'), so parse leniently into minutes after midnight for sorting
export const timeToMinutes = (time: string | null) => {
  const match = (time ?? '').match(/(\d{1,2})\s*[:;]\s*(\d{1,2})?/)
  if (!match) return -1
  let hours = Number(match[1])
  const minutes = Number(match[2] ?? 0)
  const suffix = (time ?? '').slice(match.index! + match[0].length)
  const isPm = /p/i.test(suffix)
  const isAm = !isPm && /a/i.test(suffix)
  if (isPm && hours < 12) hours += 12
  if (isAm && hours === 12) hours = 0
  return hours * 60 + minutes
}

// Sort by date, then time, then route id; keep one row per document
export const sortAndDedupeRows = (rows: OfficeReportRow[]) => {
  const seen = new Set<number>()
  return rows
    .filter((r) => {
      if (seen.has(r.adm_trackers.id)) return false
      seen.add(r.adm_trackers.id)
      return true
    })
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        timeToMinutes(a.time) - timeToMinutes(b.time) ||
        a.id - b.id,
    )
}
