/* eslint-disable react/display-name */
'use client'

import { DswdEndorsementTypes } from '@/types'
import { fetchDswdEndorsements } from '@/utils/fetchApi'
import { PrinterIcon } from 'lucide-react'
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import ReactToPrint from 'react-to-print'
import PrintSummary from './PrintSummary'

interface ModalProps {
  filterDateFrom: Date | undefined
  filterDateTo: Date | undefined
  filterType: string
}

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  items: DswdEndorsementTypes[]
  filterType: string
  filterDateFrom: Date | undefined
  filterDateTo: Date | undefined
}

export default function PrintSummaryButton({
  filterDateFrom,
  filterDateTo,
  filterType,
}: ModalProps) {
  //
  const [selectedItems, setSelectedItems] = useState<
    DswdEndorsementTypes[] | []
  >([])
  const componentRef = useRef<HTMLDivElement>(null)

  // Using forwardRef to pass the ref down to the ChildComponent
  const ChildWithRef = forwardRef<HTMLDivElement, ChildProps>((props, ref) => {
    return (
      <div style={{ pageBreakBefore: 'always' }}>
        <PrintSummary
          {...props}
          forwardedRef={ref}
          filterType={props.filterType}
          selectedItems={props.items}
          filterDateFrom={props.filterDateFrom}
          filterDateTo={props.filterDateTo}
        />
      </div>
    )
  })

  useEffect(() => {
    ;(async () => {
      if (filterDateFrom && filterDateTo) {
        const result = await fetchDswdEndorsements(
          {
            filterDateFrom,
            filterDateTo,
            filterType,
          },
          999,
          0
        )

        setSelectedItems(result.data)
      }
    })()
  }, [])

  return (
    <>
      {filterDateFrom && filterDateTo && (
        <ReactToPrint
          trigger={() => (
            <button className="app__btn_blue flex items-center justify-center space-x-2">
              <PrinterIcon className="w-4 h-4" /> <span>Print Summary</span>
            </button>
          )}
          content={() => document.getElementById('print-container')}
        />
      )}
      <div className="hidden">
        <div id="print-container">
          <ChildWithRef
            items={selectedItems}
            ref={componentRef}
            filterType={filterType}
            forwardedRef={null}
            filterDateFrom={filterDateFrom}
            filterDateTo={filterDateTo}
          />
        </div>
      </div>
    </>
  )
}
