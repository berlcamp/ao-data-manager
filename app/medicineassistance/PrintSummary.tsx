/* eslint-disable react/display-name */
'use client'

import LogoHeader from '@/components/LogoHeader'
import { MedicalAssistanceTypes } from '@/types'
import { format } from 'date-fns'
import React, { useEffect } from 'react'

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  selectedItems: MedicalAssistanceTypes[]
}

const PrintSummary: React.FC<ChildProps> = ({
  forwardedRef,
  selectedItems,
}) => {
  const countTotal = (item: MedicalAssistanceTypes) => {
    const t = item.medicines.reduce(
      (accumulator, i) => accumulator + Number(i.quantity) * Number(i.price),
      0
    )
    return t
  }

  useEffect(() => {}, [])

  return (
    <div
      ref={forwardedRef}
      className="w-full mx-auto px-10 mt-8 text-xs">
      <table className="w-full">
        <LogoHeader />
        <tbody className="text-sm">
          <tr>
            <td
              colSpan={6}
              className="text-center">
              <div className="border border-red-500 border-dashed"></div>
              <div className="border border-red-500 border-dashed mt-px"></div>
              <div className="text-xl underline underline-offset-2 mt-4 mb-6">
                AO Medicine Assistance Summary
              </div>
            </td>
          </tr>
          <tr>
            <td className="border p-1">#</td>
            <td className="border p-1">Patient</td>
            <td className="border p-1">Requester</td>
            <td className="border p-1">Date Approved</td>
            <td className="border p-1">Pharmacy</td>
            <td className="border p-1">Total Amount</td>
          </tr>
          {selectedItems.map((med, i) => (
            <tr key={i}>
              <td className="border p-1">{i + 1}</td>
              <td className="border p-1">
                <div>{med.fullname}</div>
                <div className="capitalize">
                  {med.other_details.gender} / {med.other_details.age} /{' '}
                  {med.other_details.patient_barangay.barangay}
                </div>
              </td>
              <td className="border p-1">
                <div>{med.requester}</div>
                <div className="capitalize">
                  {med.other_details.referral_gender} /{' '}
                  {med.other_details.referral_age} /{' '}
                  {med.other_details.requester_barangay.barangay}
                </div>
              </td>
              <td className="border p-1">
                {med.date_approved &&
                  format(new Date(med.date_approved), 'MM/dd/yyyy')}
              </td>
              <td className="border p-1">{med.pharmacy}</td>
              <td className="border p-1">{countTotal(med)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default PrintSummary
