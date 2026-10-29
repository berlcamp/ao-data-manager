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
  office: string
  activity: string // e.g. 'Received & Forwarded' or 'Received at OCM'
  fromDate: string // yyyy-MM-dd
  toDate: string // yyyy-MM-dd
  preparedBy: string
}

export const formatReportDate = (ymd: string) =>
  format(parseISO(ymd), 'MMMM d, yyyy')

export const formatReportPeriod = (meta: OfficeReportMeta) =>
  meta.fromDate === meta.toDate
    ? formatReportDate(meta.fromDate)
    : `${formatReportDate(meta.fromDate)} to ${formatReportDate(meta.toDate)}`
