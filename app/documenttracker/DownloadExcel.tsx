'use client'
import type { DocumentFlowchartTypes, DocumentTypes } from '@/types'
import { fetchDocuments } from '@/utils/fetchApi'
import Excel from 'exceljs'
import { saveAs } from 'file-saver'
import { useState } from 'react'
import { FaFileDownload } from 'react-icons/fa'
import { Tooltip } from 'react-tooltip'

interface DocumentFilterTypes {
  filterTypes?: any[]
  filterKeyword?: string
  filterStatus?: string
  filterCurrentRoute?: string
  filterRoute?: string
  filterDateForwardedFrom?: Date | undefined
  filterDateForwardedTo?: Date | undefined
}

const DownloadExcelButton = ({ filters }: { filters: DocumentFilterTypes }) => {
  //
  const [loading, setLoading] = useState(false)

  const getLatestForwarded = (data: DocumentFlowchartTypes[]) => {
    // Filter the entries where the title contains "forwarded"
    const forwardedEntries = data.filter((entry) =>
      entry.title.toLowerCase().includes('forwarded')
    )

    // Check if any entries were found
    if (forwardedEntries.length > 0) {
      // Find the latest date from the filtered entries
      const latestForwardedDate = forwardedEntries.reduce<any>(
        (latest, entry) => {
          return new Date(entry.date) > new Date(latest) ? entry.date : latest
        },
        forwardedEntries[0]
      )

      return `${latestForwardedDate.date} (${latestForwardedDate.title})` // Output the latest date
    } else {
      return ''
    }
  }

  const handleDownload = async () => {
    setLoading(true)
    try {
      const result = await fetchDocuments(filters, 999, 0)

      const results: DocumentTypes[] | [] = result.data

      // Create a new workbook and add a worksheet
      const workbook = new Excel.Workbook()
      const worksheet = workbook.addWorksheet('Sheet 1')

      // Add data to the worksheet
      worksheet.columns = [
        { header: '#', key: 'no', width: 20 },
        { header: 'Date Received', key: 'date_received', width: 20 },
        { header: 'Date Forwarded', key: 'date_forwarded', width: 20 },
        { header: 'Routing No', key: 'routing', width: 20 },
        { header: 'Name/Payee', key: 'requester', width: 20 },
        { header: 'Amount', key: 'amount', width: 20 },
        { header: 'Agency/Department', key: 'agency', width: 20 },
        { header: 'Current Location ', key: 'location', width: 20 },
        { header: 'Particulars ', key: 'particulars', width: 20 },
        { header: 'Remarks', key: 'remarks', width: 20 },
        // Add more columns based on your data structure
      ]

      worksheet.getColumn(8).alignment = { wrapText: true }

      // Data for the Excel file
      const data: any[] = []
      results?.forEach((item: DocumentTypes, index) => {
        let remarks = item.recent_remarks?.remarks
        data.push({
          no: index + 1,
          date_received: item.date_received,
          date_forwarded: getLatestForwarded(item.adm_tracker_routes),
          routing: item.routing_slip_no,
          requester: item.requester,
          amount: item.amount,
          agency: item.agency,
          location: item.location,
          particulars: item.particulars,
          remarks,
        })
      })

      data.forEach((item) => {
        worksheet.addRow(item)
      })

      // Generate the Excel file
      await workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        saveAs(blob, 'Document Tracker Data.xlsx')
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        className="flex items-center justify-end space-x-1 font-bold py-1 text-xs text-gray-500 rounded-sm"
        disabled={loading}
        onClick={handleDownload}
        data-tooltip-id="excel-tooltip"
        data-tooltip-content="Download Data to Excel">
        {loading && <span>Downloading...</span>}
        <FaFileDownload className="h-6 w-6 text-green-700" />
      </button>
      <Tooltip
        id="excel-tooltip"
        place="bottom-end"
      />
    </>
  )
}

export default DownloadExcelButton
