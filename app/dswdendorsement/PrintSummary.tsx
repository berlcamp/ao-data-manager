/* eslint-disable react/display-name */
'use client'

import LogoHeader from '@/components/LogoHeader'
import { DswdEndorsementTypes } from '@/types'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  selectedItems: DswdEndorsementTypes[]
}

const PrintSummary: React.FC<ChildProps> = ({
  forwardedRef,
  selectedItems,
}) => {
  //
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    const t = selectedItems.reduce(
      (accumulator, i) => accumulator + Number(i.amount),
      0
    )

    setTotalAmount(t)
  }, [])

  return (
    <div
      ref={forwardedRef}
      className="w-full mx-auto px-10 mt-8 text-xs">
      <table className="w-full">
        <tbody className="text-sm">
          <LogoHeader />
          <tr>
            <td
              colSpan={6}
              className="text-center">
              <div className="border border-red-500 border-dashed"></div>
              <div className="border border-red-500 border-dashed mt-px"></div>
              <div className="text-xl underline underline-offset-2 mt-4 mb-6">
                DSWD Endorsements Summary
              </div>
            </td>
          </tr>
          <tr>
            <td className="text-center border_black p-1">#</td>
            <td className="text-center border_black p-1">Patient</td>
            <td className="text-center border_black p-1">Requester</td>
            <td className="text-center border_black p-1">Date</td>
            <td className="text-center border_black p-1">Type</td>
            <td className="text-center border_black p-1">Amount</td>
          </tr>
          {selectedItems.map((med, i) => (
            <tr key={i}>
              <td className="border_black p-1">{i + 1}</td>
              <td className="border_black p-1">
                <div>{med.patient_fullname}</div>
                <div className="capitalize">
                  {med.patient_gender} / {med.patient_age} /{' '}
                  {med.patient_address}
                </div>
              </td>
              <td className="border_black p-1">
                <div>{med.requester_fullname}</div>
                <div className="capitalize">
                  {med.requester_gender} / {med.requester_age} /{' '}
                  {med.requester_address}
                </div>
              </td>
              <td className="border_black p-1">
                {med.date && format(new Date(med.date), 'MM/dd/yyyy')}
              </td>
              <td className="border_black p-1">
                {med.type !== 'Other' ? med.type : med.other}
              </td>
              <td className="border_black p-1">{med.amount}</td>
            </tr>
          ))}
          <tr>
            <td
              colSpan={4}
              className="text-xs font-bold p-px text-right"></td>
            <td
              colSpan={2}
              className="text-xs font-bold p-px">
              <div className="mt-2 pl-20">
                Total Amount: ₱
                {totalAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="mt-2 pl-20">
                Total Beneficiaries: {selectedItems.length}
              </div>
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className="text-xs font-bold p-px text-center pt-4">
              <div>Prepared By:</div>
              <div className="mt-6">RINO KARLO G. LIM</div>
              <div>Executive Assistant IV</div>
            </td>
            <td
              colSpan={4}
              className="text-xs font-bold p-px text-center pt-4">
              <div>Noted By:</div>
              <div className="mt-6">CAROLYN N. GO</div>
              <div>Executive Assistant V</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
export default PrintSummary
