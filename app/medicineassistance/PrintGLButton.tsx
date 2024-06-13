/* eslint-disable react/display-name */
'use client'

import { MedicalAssistanceTypes } from '@/types'
import { PrinterIcon } from 'lucide-react'
import React, { forwardRef, useRef } from 'react'
import ReactToPrint from 'react-to-print'
import PrintGL from './PrintGL'
import PrintGLCHO from './PrintGLCHO'

interface ModalProps {
  selectedItem: MedicalAssistanceTypes
}

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  item: MedicalAssistanceTypes
}

export default function PrintGLButton({ selectedItem }: ModalProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  // Using forwardRef to pass the ref down to the ChildComponent
  const ChildWithRef = forwardRef<HTMLDivElement, ChildProps>((props, ref) => {
    return (
      <div style={{ pageBreakBefore: 'always' }}>
        {props.item.pharmacy_code === 'CHO' ? (
          <PrintGLCHO
            {...props}
            forwardedRef={ref}
            selectedItem={props.item}
          />
        ) : (
          <PrintGL
            {...props}
            forwardedRef={ref}
            selectedItem={props.item}
          />
        )}
      </div>
    )
  })

  return (
    <>
      <ReactToPrint
        trigger={() => (
          <button className="app__btn_blue flex items-center justify-center space-x-2">
            <PrinterIcon className="w-4 h-4" /> <span>Print GL</span>
          </button>
        )}
        content={() => document.getElementById('print-container-gl')}
      />
      <div className="hidden">
        <div id="print-container-gl">
          <ChildWithRef
            item={selectedItem}
            ref={componentRef}
            forwardedRef={null}
          />
        </div>
      </div>
    </>
  )
}
