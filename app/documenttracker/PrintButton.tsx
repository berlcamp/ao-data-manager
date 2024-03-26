/* eslint-disable react/display-name */
'use client'

import { CustomButton } from '@/components/index'
import { DocumentTypes } from '@/types'
import React, { forwardRef, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import PrintSlip from './PrintSlip'

interface ModalProps {
  document: DocumentTypes
}

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  document: DocumentTypes
}

export default function PrintButton({ document }: ModalProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  // Using forwardRef to pass the ref down to the ChildComponent
  const ChildWithRef = forwardRef<HTMLDivElement, ChildProps>((props, ref) => {
    return (
      <div style={{ display: 'none' }}>
        <PrintSlip
          {...props}
          forwardedRef={ref}
          document={document}
        />
      </div>
    )
  })

  const print = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Print Slip',
  })

  const handlePrint = () => {
    print()
  }

  return (
    <>
      <CustomButton
        btnType="button"
        title="Print Slip"
        handleClick={handlePrint}
        containerStyles="app__btn_blue_xs"
      />

      <ChildWithRef
        document={document}
        ref={componentRef}
        forwardedRef={null}
      />
    </>
  )
}
