/* eslint-disable react/display-name */
'use client'

import LogoHeader from '@/components/LogoHeader'
import { MedicalAssistanceTypes, MedicineItemTypes } from '@/types'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  selectedItems: MedicalAssistanceTypes[]
}

const PrintSummary: React.FC<ChildProps> = ({
  forwardedRef,
  selectedItems,
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
              colSpan={6}
              className="text-center">
              <div className="border border-red-500 border-dashed"></div>
              <div className="border border-red-500 border-dashed mt-px"></div>
              <div className="text-xl underline underline-offset-2 mt-4">
                AO Medication Assistance Summary
              </div>
              <div className="text-xl mt-1 mb-6">
                {selectedItems[0]?.date_approved &&
                  format(
                    new Date(selectedItems[0].date_approved),
                    'MMMM dd, yyyy'
                  )}
              </div>
            </td>
          </tr>
          <tr>
            <td className="text-center border_black p-1">#</td>
            <td className="text-center border_black p-1">Patient</td>
            <td className="text-center border_black p-1">Requester</td>
            <td className="text-center border_black p-1">Date Approved</td>
            {/* <td className="text-center border_black p-1">Pharmacy</td> */}
            <td className="text-center border_black p-1">Medicines</td>
            <td className="text-center border_black p-1">Total Amount</td>
          </tr>
          {selectedItems.map((med, i) => (
            <tr key={i}>
              <td className="border_black p-1">{i + 1}</td>
              <td className="border_black p-1">
                <div>{med.fullname}</div>
                <div className="capitalize">
                  {med.gender} / {med.age} / {med.address}
                </div>
              </td>
              <td className="border_black p-1">
                <div>{med.requester}</div>
                <div className="capitalize">
                  {med.referral_gender} / {med.referral_age} /{' '}
                  {med.referral_address}
                </div>
              </td>
              <td className="border_black p-1">
                {med.date_approved &&
                  format(new Date(med.date_approved), 'MM/dd/yyyy')}
              </td>
              {/* <td className="border_black p-1">{med.pharmacy}</td> */}
              <td className="border_black p-1">
                {med.medicines.map((m: MedicineItemTypes, i: number) => (
                  <div key={i}>
                    <span>{m.description}</span>
                    <span>({m.unit})</span>
                  </div>
                ))}
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
                Total Beneficiaries: {totalBeneficiaries}
              </div>
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className="text-xs font-bold p-px text-center pt-4">
              <div>Prepared By:</div>
              <div className="mt-6">ANALYN D. RADORES</div>
              <div>Admin Aide IV</div>
            </td>
            <td
              colSpan={4}
              className="text-xs font-bold p-px text-center pt-4">
              <div>Noted By:</div>
              <div className="mt-6">RINO KARLO G. LIM</div>
              <div>Executive Assistant IV</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
export default PrintSummary
