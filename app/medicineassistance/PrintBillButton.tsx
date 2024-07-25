/* eslint-disable react/display-name */
'use client'

import { MedicalAssistanceTypes } from '@/types'
import { fetchMedicineClients } from '@/utils/fetchApi'
import { PrinterIcon } from 'lucide-react'
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import ReactToPrint from 'react-to-print'
import PrintBill from './PrintBill'

interface ModalProps {
  filterKeyword: string
  filterPharmacy: string
  filterDateRequested: Date | undefined
  filterDateFrom: Date | undefined
  filterDateTo: Date | undefined
  filterBillType: string
  filterOffset: number
}

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  items: MedicalAssistanceTypes[]
  pharmacy: string
  from: Date | undefined
  to: Date | undefined
  offset: number
}

export default function PrintBillButton({
  filterKeyword,
  filterPharmacy,
  filterDateRequested,
  filterDateFrom,
  filterDateTo,
  filterBillType,
  filterOffset,
}: ModalProps) {
  //
  const [selectedItems, setSelectedItems] = useState<
    MedicalAssistanceTypes[] | []
  >([])
  const componentRef = useRef<HTMLDivElement>(null)

  // Using forwardRef to pass the ref down to the ChildComponent
  const ChildWithRef = forwardRef<HTMLDivElement, ChildProps>((props, ref) => {
    return (
      <div style={{ pageBreakBefore: 'always' }}>
        <PrintBill
          {...props}
          forwardedRef={ref}
          selectedItems={props.items}
          pharmacy={props.pharmacy}
          from={props.from}
          to={props.to}
          offset={props.offset}
        />
      </div>
    )
  })

  useEffect(() => {
    ;(async () => {
      if (filterDateFrom && filterDateTo) {
        const result = await fetchMedicineClients(
          {
            filterKeyword,
            filterPharmacy,
            filterDateRequested,
            filterDateFrom,
            filterDateTo,
          },
          999,
          0
        )

        const filteredData = result.data.filter((d: MedicalAssistanceTypes) => {
          // all
          if (filterBillType === 'All' && d.status === 'Approved') {
            return d
          }

          // WOMEN
          if (filterBillType === 'WOMEN') {
            const female =
              d.other_details.gender === 'female' ||
              d.other_details.referral_gender === 'female'
            const age = Number(d.other_details.age) > 17
            const patient_type =
              d.other_details.patient_type === null ||
              d.other_details.patient_type === ''
            if (female && age && patient_type && d.status === 'Approved') {
              return d
            }
          }

          // CHILDREN
          if (filterBillType === 'CHILDREN') {
            const age = Number(d.other_details.age) < 18
            const patient_type =
              d.other_details.patient_type === null ||
              d.other_details.patient_type === ''
            if (age && patient_type && d.status === 'Approved') {
              return d
            }
          }

          // DONATION
          if (filterBillType === 'DONATION') {
            const male =
              d.other_details.gender === 'male' &&
              d.other_details.referral_gender === 'male'
            const age = Number(d.other_details.age) >= 18
            const patient_type =
              d.other_details.patient_type === null ||
              d.other_details.patient_type === ''
            if (male && age && patient_type && d.status === 'Approved') {
              return d
            }
          }

          // PWD
          if (filterBillType === 'PWD') {
            const patient_type = d.other_details.patient_type === 'PWD'
            if (patient_type && d.status === 'Approved') {
              return d
            }
          }

          // SENIOR
          if (filterBillType === 'SENIOR') {
            const patient_type = d.other_details.patient_type === 'Senior'
            if (patient_type && d.status === 'Approved') {
              return d
            }
          }
        })

        setSelectedItems(filteredData)
      }
    })()
  }, [])

  return (
    <>
      {filterDateFrom && filterDateTo && (
        <ReactToPrint
          trigger={() => (
            <button className="app__btn_blue flex items-center justify-center space-x-2">
              <PrinterIcon className="w-4 h-4" />{' '}
              <span>Print Bill ({selectedItems.length})</span>
            </button>
          )}
          content={() => document.getElementById('bill-container')}
        />
      )}
      <div className="hidden">
        <div id="bill-container">
          <ChildWithRef
            items={selectedItems}
            pharmacy={filterPharmacy}
            from={filterDateFrom}
            to={filterDateTo}
            offset={filterOffset}
            ref={componentRef}
            forwardedRef={null}
          />
        </div>
      </div>
    </>
  )
}
