import { formatAmountWithCommas } from '@/utils/text-helper'
import Excel from 'exceljs'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import {
  formatReportPeriod,
  sortAndDedupeRows,
  type OfficeReportMeta,
  type OfficeReportRow,
} from './officeReportShared'

const fileBaseName = (meta: OfficeReportMeta) => {
  const period =
    meta.fromDate === meta.toDate
      ? meta.fromDate
      : `${meta.fromDate} to ${meta.toDate}`
  return `Office Report - ${meta.location} - ${period}`.replace(
    /[\\/:*?"<>|]/g,
    '-',
  )
}

// Collapse tabs/newlines/double spaces typed into the fields
const clean = (value: string | null) =>
  (value ?? '').replace(/\s+/g, ' ').trim()

// Particulars with the amount below it, separated by a blank line
const particularsWithAmount = (row: OfficeReportRow) => {
  const particulars = clean(row.adm_trackers.particulars)
  const amount = clean(row.adm_trackers.amount)
  if (!amount) return particulars
  const line = `Amount: ${formatAmountWithCommas(amount)}`
  return particulars ? `${particulars}\n\n${line}` : line
}

const remarksText = (row: OfficeReportRow) =>
  clean(row.adm_trackers.recent_remarks?.remarks ?? null)

const reportColumns = [
  '#',
  'Routing No',
  'Name/Payee',
  'Agency/Department',
  'Particulars',
  'Current Location',
  'Remarks',
]

const reportCells = (row: OfficeReportRow, i: number) => [
  i + 1,
  clean(row.adm_trackers.routing_slip_no),
  clean(row.adm_trackers.requester),
  clean(row.adm_trackers.agency),
  particularsWithAmount(row),
  clean(row.adm_trackers.location),
  remarksText(row),
]

const buildPdf = (inputRows: OfficeReportRow[], meta: OfficeReportMeta) => {
  const rows = sortAndDedupeRows(inputRows)
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
  doc.text(`Original Location: ${meta.location}`, margin, 21)
  doc.text(
    `Logged By: ${meta.loggedBy || 'All users'}`,
    margin,
    26,
  )
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
    head: [reportColumns],
    body: rows.map(reportCells),
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      overflow: 'linebreak',
      valign: 'middle',
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: 0,
    },
    headStyles: {
      fillColor: 255,
      textColor: 0,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      // Widths (mm) fit legal landscape: 356mm page minus 20mm margins
      0: { cellWidth: 10, halign: 'right' },
      1: { cellWidth: 30 },
      2: { cellWidth: 45 },
      3: { cellWidth: 45 },
      4: { cellWidth: 'auto' }, // takes the remaining width
      5: { cellWidth: 40, halign: 'center' },
      6: { cellWidth: 40, halign: 'center' },
    },
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(8)
      doc.setTextColor(120)
      doc.text(
        `${meta.location} | ${formatReportPeriod(meta)}`,
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

const thinBorder: Partial<Excel.Borders> = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
}

export const downloadOfficeReportExcel = async (
  inputRows: OfficeReportRow[],
  meta: OfficeReportMeta,
) => {
  const rows = sortAndDedupeRows(inputRows)
  const workbook = new Excel.Workbook()
  // Sheet names can't contain \ / ? * [ ] : and max 31 chars
  const worksheet = workbook.addWorksheet(
    meta.location.replace(/[\\/?*[\]:]/g, '-').substring(0, 31),
  )

  worksheet.addRow(['Document Tracker - Office Report']).font = {
    bold: true,
    size: 14,
  }
  worksheet.addRow([`Original Location: ${meta.location}`])
  worksheet.addRow([`Logged By: ${meta.loggedBy || 'All users'}`])
  worksheet.addRow([`Date: ${formatReportPeriod(meta)}`])
  worksheet.addRow([`Document Type: ${meta.types}`])
  worksheet.addRow([`Total Documents: ${rows.length}`])
  worksheet.addRow([
    `Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')} by ${meta.preparedBy}`,
  ])
  worksheet.addRow([])

  const widths = [6, 20, 28, 26, 60, 22, 26]
  const headers = reportColumns.map((header, i) => ({
    header,
    width: widths[i],
  }))
  headers.forEach((h, i) => {
    worksheet.getColumn(i + 1).width = h.width
  })

  const headerRow = worksheet.addRow(headers.map((h) => h.header))
  headerRow.font = { bold: true }
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFFFF' },
    }
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    }
    cell.border = thinBorder
  })
  const headerRowNumber = headerRow.number

  rows.forEach((row, i) => {
    const added = worksheet.addRow(reportCells(row, i))
    added.eachCell({ includeEmpty: true }, (cell, col) => {
      cell.border = thinBorder
      cell.alignment = {
        vertical: 'middle',
        wrapText: true,
        horizontal: col === 1 ? 'right' : col >= 6 ? 'center' : 'left',
      }
    })
  })

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
