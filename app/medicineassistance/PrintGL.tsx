/* eslint-disable react/display-name */
'use client'

import LogoHeader from '@/components/LogoHeader'
import { pharmacyList } from '@/constants/TrackerConstants'
import { MedicalAssistanceTypes } from '@/types'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { ToWords } from 'to-words'

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  selectedItem: MedicalAssistanceTypes
}

const PrintGL: React.FC<ChildProps> = ({ forwardedRef, selectedItem }) => {
  //
  const [totalAmount, setTotalAmount] = useState(0)

  const pharmacy = pharmacyList.find(
    (p) => p.pharmacy === selectedItem.pharmacy
  )

  const convertToWord = (amount: number) => {
    const toWords = new ToWords({
      converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        currencyOptions: {
          // can be used to override defaults for the selected locale
          name: 'Peso',
          plural: 'Pesos',
          symbol: 'P',
          fractionalUnit: {
            name: 'Centavo',
            plural: 'Centavos',
            symbol: '',
          },
        },
      },
    })
    return toWords.convert(amount, { currency: true })
  }

  useEffect(() => {
    const t = selectedItem.medicines.reduce(
      (accumulator, i) => accumulator + Number(i.quantity) * Number(i.price),
      0
    )
    setTotalAmount(t)
  }, [])

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
              <div className="text-xl underline underline-offset-2 mt-4">
                GUARANTEE NOTE - NO.{' '}
                {format(new Date(selectedItem.date_approved), 'yy')}
                -AO-OZC-MED-{pharmacy?.code}-000{selectedItem.gl_no}
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={6}>
              <div className="mt-6">
                {format(new Date(selectedItem.date_approved), 'dd MMMM yyyy')}
              </div>
              <div className="uppercase mt-6 font-bold">
                {pharmacy?.director}
              </div>
              <div className="">{pharmacy?.title}</div>
              <div className="">{pharmacy?.pharmacy}</div>
              <div className="">{pharmacy?.address}</div>
              <div className="mt-6 font-bold">Dear {pharmacy?.dear}</div>
              <div className="mt-6">
                <div>
                  <span className="font-bold uppercase">
                    {selectedItem.fullname}
                  </span>{' '}
                  sought help from the Office of the City Mayor for financial
                  assistance for his/her medication needs through{' '}
                  <span className="font-bold uppercase">
                    {selectedItem.requester}.
                  </span>
                </div>
                <div className="mt-2">
                  In an effort to strengthen the social assistance program of
                  the local government unit of Ozamiz, the Asenso Ozamiz
                  administration enacted Ordinance No. 1291-2024, also known as
                  the &quot;OZAMIZ CITY FREE MEDICATION PROGRAM&quot;.
                </div>
                <div className="mt-2 mb-6">
                  In accordance with the abovementioned program and pursuant to
                  the Prescription attached herein, we hereby guarantee the
                  payment for the medicine/s listed below in the amount of{' '}
                  <span className="font-bold uppercase">
                    {convertToWord(totalAmount)} (
                    {totalAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    ).
                  </span>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td className="text-xs border p-px">#</td>
            <td className="text-xs border p-px">Description</td>
            <td className="text-xs border p-px">Unit</td>
            <td className="text-xs border p-px">Quantity</td>
            <td className="text-xs border p-px">Price</td>
            <td className="text-xs border p-px">Total Amount</td>
          </tr>
          {selectedItem.medicines.map((med, i) => (
            <tr key={i}>
              <td className="text-xs border p-px">{i + 1}</td>
              <td className="text-xs border p-px">{med.description}</td>
              <td className="text-xs border p-px">{med.unit}</td>
              <td className="text-xs border p-px">{med.quantity}</td>
              <td className="text-xs border p-px">
                {Number(med.price).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="text-xs border p-px">
                {(Number(med.price) * Number(med.quantity)).toLocaleString(
                  'en-US',
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td
              colSpan={5}
              className="text-xs border font-bold p-px text-right">
              Total:
            </td>
            <td className="text-xs border font-bold p-px">
              {totalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
          <tr>
            <td colSpan={6}>
              <div className="mt-6">
                This must be claimed within 3 days from the issue of this
                guarantee note.
              </div>
              <div className="mt-2">
                We undertake to pay the said amount after fifteen (15) days from
                receipt of written demand. All sums owing under this letter are
                payable in Philippine peso.
              </div>
              <div className="mt-10">By the authority of: </div>
              <div className="mt-6 font-bold">
                ATTY. HENRY &quot;INDY&quot; F. OAMINAL, JR.
              </div>
              <div className="mt-2">City Mayor</div>
              <div className="mt-10">Respectfully yours,</div>
              <div className="mt-10 font-bold">CAROLYN N. GO</div>
              <div className="mt-2">Executive Assistant V</div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6}>
              <div className="absolute bottom-3 left-0 px-10">
                <div className="text-center text-xs">
                  This document is not valid unless it bears the official seal
                  of the City Mayor. Any erasure, alteration, insertion or the
                  like herein, renders the same invalid.
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
export default PrintGL
