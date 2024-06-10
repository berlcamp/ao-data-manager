/* eslint-disable react/display-name */
'use client'

import { MedicalAssistanceTypes } from '@/types'
import { PrinterIcon } from 'lucide-react'
import React, { forwardRef, useRef } from 'react'
import ReactToPrint from 'react-to-print'
import PrintSummary from './PrintSummary'

interface ModalProps {
  selectedItems: MedicalAssistanceTypes[]
}

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  items: MedicalAssistanceTypes[]
}

export default function PrintSummaryButton({ selectedItems }: ModalProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  // Using forwardRef to pass the ref down to the ChildComponent
  const ChildWithRef = forwardRef<HTMLDivElement, ChildProps>((props, ref) => {
    return (
      <div style={{ pageBreakBefore: 'always' }}>
        <PrintSummary
          {...props}
          forwardedRef={ref}
          selectedItems={props.items}
        />
      </div>
    )
  })

  return (
    <>
      <ReactToPrint
        trigger={() => (
          <button className="app__btn_blue flex items-center justify-center space-x-2">
            <PrinterIcon className="w-4 h-4" /> <span>Print Summary</span>
          </button>
        )}
        content={() => document.getElementById('print-container')}
      />
      <div className="hidden">
        <div id="print-container">
          <ChildWithRef
            items={selectedItems}
            ref={componentRef}
            forwardedRef={null}
          />
        </div>
      </div>
    </>
  )
}
