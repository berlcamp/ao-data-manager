import { formatAmountWithCommas } from '@/utils/text-helper'
import Excel from 'exceljs'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format, parseISO } from 'date-fns'
import {
  formatReportPeriod,
  type OfficeReportMeta,
  type OfficeReportRow,
} from './officeReportShared'

const fileBaseName = (meta: OfficeReportMeta) => {
  const period =
    meta.fromDate === meta.toDate
      ? meta.fromDate
      : `${meta.fromDate} to ${meta.toDate}`
  return `Office Report - ${meta.office} - ${period}`.replace(
    /[\\/:*?"<>|]/g,
    '-',
  )
}

// Amounts are stored as text; return a number when it parses, else the raw text
const toAmount = (value: string | null): number | string => {
  if (!value || value.trim() === '') return ''
  const n = Number(value.replace(/,/g, '').trim())
  return Number.isNaN(n) ? value : n
}

// Collapse tabs/newlines/double spaces typed into the fields
const clean = (value: string | null) =>
  (value ?? '').replace(/\s+/g, ' ').trim()

// exceljs stores dates as UTC, so build the date at UTC midnight to avoid
// it showing as the previous day in timezones ahead of UTC
const excelDate = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

const dateTimeLabel = (row: OfficeReportRow, isSingleDay: boolean) => {
  const time = row.time ?? ''
  if (isSingleDay) return time
  return `${format(parseISO(row.date), 'MMM d, yyyy')}${time ? ` ${time}` : ''}`
}

const buildPdf = (rows: OfficeReportRow[], meta: OfficeReportMeta) => {
  const isSingleDay = meta.fromDate === meta.toDate
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'legal',
  })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Document Tracker - Office Report', margin, 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Office: ${meta.office}`, margin, 21)
  doc.text(`Activity: ${meta.activity}`, margin, 26)
  doc.text(`Date: ${formatReportPeriod(meta)}`, margin, 31)
  // A long type selection wraps, pushing the table down
  const typeLines: string[] = doc.splitTextToSize(
    `Document Type: ${meta.types}`,
    pageWidth * 0.65,
  )
  doc.text(typeLines, margin, 36)
  const tableStartY = 36 + typeLines.length * 5
  doc.text(`Total Documents: ${rows.length}`, pageWidth - margin, 21, {
    align: 'right',
  })
  doc.text(
    `Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`,
    pageWidth - margin,
    26,
    { align: 'right' },
  )

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin, bottom: 14 },
    head: [
      [
        '#',
        isSingleDay ? 'Time' : 'Date/Time',
        'Routing No',
        'Type',
        'Requester/Payee',
        'Agency',
        'Amount',
        'Particulars',
        'Activity',
        'Logged By',
        'Current Location',
        'Status',
      ],
    ],
    body: rows.map((row, i) => [
      i + 1,
      dateTimeLabel(row, isSingleDay),
      clean(row.adm_trackers.routing_slip_no),
      clean(row.adm_trackers.type),
      clean(row.adm_trackers.requester),
      clean(row.adm_trackers.agency),
      formatAmountWithCommas(row.adm_trackers.amount),
      clean(row.adm_trackers.particulars),
      row.title,
      clean(row.user),
      clean(row.adm_trackers.location),
      clean(row.adm_trackers.status),
    ]),
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      overflow: 'linebreak',
      valign: 'top',
    },
    headStyles: { fillColor: [55, 65, 81], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'right' },
      // Widths (mm) fit legal landscape: 356mm page minus 20mm margins
      1: { cellWidth: isSingleDay ? 16 : 28 },
      2: { cellWidth: 26 },
      3: { cellWidth: 22 },
      4: { cellWidth: 32 },
      5: { cellWidth: 32 },
      6: { halign: 'right', cellWidth: 20 },
      7: { cellWidth: 'auto' }, // takes the remaining width
      8: { cellWidth: 26 },
      9: { cellWidth: 22 },
      10: { cellWidth: 26 },
      11: { cellWidth: 18 },
    },
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(8)
      doc.setTextColor(120)
      doc.text(
        `${meta.office} | ${formatReportPeriod(meta)}`,
        margin,
        pageHeight - 6,
      )
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber} of {total_pages}`,
        pageWidth - margin,
        pageHeight - 6,
        { align: 'right' },
      )
      doc.setTextColor(0)
    },
  })

  // Signature block
  const pageHeight = doc.internal.pageSize.getHeight()
  let y = ((doc as any).lastAutoTable?.finalY ?? tableStartY) + 14
  if (y > pageHeight - 30) {
    doc.addPage()
    y = 20
  }
  doc.setFontSize(10)
  doc.text('Prepared by:', margin, y)
  doc.line(margin, y + 12, margin + 70, y + 12)
  doc.text(meta.preparedBy, margin, y + 17)
  doc.text('Received/Verified by:', margin + 110, y)
  doc.line(margin + 110, y + 12, margin + 180, y + 12)

  doc.putTotalPages('{total_pages}')
  return doc
}

export const downloadOfficeReportPdf = (
  rows: OfficeReportRow[],
  meta: OfficeReportMeta,
) => {
  buildPdf(rows, meta).save(`${fileBaseName(meta)}.pdf`)
}

export const printOfficeReportPdf = (
  rows: OfficeReportRow[],
  meta: OfficeReportMeta,
) => {
  const doc = buildPdf(rows, meta)
  doc.autoPrint()
  const url = doc.output('bloburl')
  const win = window.open(url, '_blank')
  // Popup blocked: fall back to downloading the file
  if (!win) doc.save(`${fileBaseName(meta)}.pdf`)
}

export const downloadOfficeReportExcel = async (
  rows: OfficeReportRow[],
  meta: OfficeReportMeta,
) => {
  const workbook = new Excel.Workbook()
  const worksheet = workbook.addWorksheet(meta.office.substring(0, 31))

  worksheet.addRow(['Document Tracker - Office Report']).font = {
    bold: true,
    size: 14,
  }
  worksheet.addRow([`Office: ${meta.office}`])
  worksheet.addRow([`Activity: ${meta.activity}`])
  worksheet.addRow([`Date: ${formatReportPeriod(meta)}`])
  worksheet.addRow([`Document Type: ${meta.types}`])
  worksheet.addRow([`Total Documents: ${rows.length}`])
  worksheet.addRow([
    `Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')} by ${meta.preparedBy}`,
  ])
  worksheet.addRow([])

  const headers = [
    { header: '#', width: 6 },
    { header: 'Date', width: 14 },
    { header: 'Time', width: 10 },
    { header: 'Routing No', width: 20 },
    { header: 'Type', width: 20 },
    { header: 'Requester/Payee', width: 28 },
    { header: 'Agency/Department', width: 24 },
    { header: 'Amount', width: 16 },
    { header: 'Particulars', width: 50 },
    { header: 'Activity', width: 24 },
    { header: 'Logged By', width: 24 },
    { header: 'Current Location', width: 24 },
    { header: 'Status', width: 14 },
  ]
  headers.forEach((h, i) => {
    worksheet.getColumn(i + 1).width = h.width
  })

  const headerRow = worksheet.addRow(headers.map((h) => h.header))
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF374151' },
    }
    cell.alignment = { vertical: 'middle', wrapText: true }
  })
  const headerRowNumber = headerRow.number

  rows.forEach((row, i) => {
    const added = worksheet.addRow([
      i + 1,
      excelDate(row.date),
      clean(row.time),
      clean(row.adm_trackers.routing_slip_no),
      clean(row.adm_trackers.type),
      clean(row.adm_trackers.requester),
      clean(row.adm_trackers.agency),
      toAmount(row.adm_trackers.amount),
      clean(row.adm_trackers.particulars),
      row.title,
      clean(row.user),
      clean(row.adm_trackers.location),
      clean(row.adm_trackers.status),
    ])
    added.alignment = { vertical: 'top', wrapText: true }
  })

  worksheet.getColumn(2).numFmt = 'mmm d, yyyy'
  worksheet.getColumn(8).numFmt = '#,##0.00'
  worksheet.views = [{ state: 'frozen', ySplit: headerRowNumber }]
  worksheet.autoFilter = {
    from: { row: headerRowNumber, column: 1 },
    to: { row: headerRowNumber, column: headers.length },
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `${fileBaseName(meta)}.xlsx`)
}
