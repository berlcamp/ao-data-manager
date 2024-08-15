/* eslint-disable react/display-name */
'use client'

import LogoHeader from '@/components/LogoHeader'
import { MedicalAssistanceTypes } from '@/types'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  selectedItems: MedicalAssistanceTypes[]
  pharmacy: string
  from: Date | undefined
  to: Date | undefined
  offset: number
}

const PrintBill: React.FC<ChildProps> = ({
  forwardedRef,
  selectedItems,
  pharmacy,
  from,
  to,
  offset,
}) => {
  //
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0)

  const countTotal = (item: MedicalAssistanceTypes) => {
    const t = item.medicines.reduce(
      (accumulator, i) => accumulator + Number(i.quantity) * Number(i.price),
      0
    )
    return t
  }

  useEffect(() => {
    let total = 0
    let b = 0
    const uniqueFullNames = new Set()

    selectedItems.forEach((s) => {
      const t = s.medicines.reduce(
        (accumulator, i) => accumulator + Number(i.quantity) * Number(i.price),
        0
      )
      total += t

      uniqueFullNames.add(s.fullname)
    })

    setTotalAmount(total)
    setTotalBeneficiaries(uniqueFullNames.size)
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
              colSpan={5}
              className="text-center">
              <div className="border border-red-500 border-dashed"></div>
              <div className="border border-red-500 border-dashed mt-px"></div>
              <div className="text-xl font-bold mt-4 uppercase">
                {pharmacy} BILL
              </div>
              {from && to && (
                <div className="text-lg mt-1 mb-6">
                  {format(new Date(from), 'PP')} to {format(new Date(to), 'PP')}
                </div>
              )}
            </td>
          </tr>
          <tr>
            <td className="text-center border_black p-1">#</td>
            <td className="text-center border_black p-1">Date</td>
            <td className="text-center border_black p-1">Patient</td>
            <td className="text-center border_black p-1">Address</td>
            <td className="text-center border_black p-1">Amount</td>
          </tr>
          {selectedItems.map((med, i) => (
            <tr
              key={i}
              className={i + 1 === Number(offset) ? 'break-after' : ''}>
              <td className="border_black p-1">{i + 1}</td>
              <td className="border_black p-1">
                {med.date_approved && format(new Date(med.date_approved), 'PP')}
              </td>
              <td className="border_black p-1">
                <div>{med.fullname}</div>
                <div className="capitalize">
                  {med.other_details.gender} / {med.other_details.age}
                </div>
              </td>
              <td className="border_black p-1">
                <div className="capitalize">
                  {med.other_details.requester_barangay.barangay},{' '}
                  {med.other_details.requester_barangay.municipality}
                </div>
              </td>
              <td className="border_black p-1">
                {countTotal(med).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
          <tr>
            <td
              colSpan={3}
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
                Total Beneficiaries: {totalBeneficiaries}
              </div>
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className="text-xs font-bold p-px text-center pt-4">
              <div>Prepared By:</div>
              <div className="mt-6">RINO KARLO G. LIM</div>
              <div>Executive Assistant - IV</div>

              <div className="mt-5">Noted By:</div>
              <div className="mt-6">CAROLYN N. GO</div>
              <div>Executive Assistant - V</div>
            </td>
            <td
              colSpan={3}
              className="text-xs font-bold p-px text-center align-top pt-4">
              <div>Approved By:</div>
              <div className="mt-6">
                ATTY. HENRY &quot;INDY&quot; F. OAMINAL, JR.
              </div>
              <div>City Mayor</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
export default PrintBill
