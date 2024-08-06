/* eslint-disable react/display-name */
'use client'

import LogoHeader from '@/components/LogoHeader'
import { DswdEndorsementTypes } from '@/types'
import { format } from 'date-fns'
import React from 'react'
import { ToWords } from 'to-words'

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  selectedItem: DswdEndorsementTypes
}

const PrintEndorsement: React.FC<ChildProps> = ({
  forwardedRef,
  selectedItem,
}) => {
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

  let requester = ''
  let patient = ''
  let request = ''
  let gender_address = ''
  let amount = ''
  let inline = ''

  if (selectedItem.requester_fullname === '') {
    requester = `${selectedItem.patient_fullname}`
    if (selectedItem.patient_gender === 'Male') {
      gender_address = 'his'
      request = `${selectedItem.type}`
    } else {
      gender_address = 'her'
      request = `${selectedItem.type}`
    }
  } else {
    requester = selectedItem.requester_fullname
    request = `${selectedItem.type} of `
    patient = `${selectedItem.patient_fullname}`
  }

  if (selectedItem.amount !== '') {
    amount = `${convertToWord(Number(selectedItem.amount))}`
    amount =
      amount +
      ` (₱ ${Number(selectedItem.amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })})`
  }

  if (selectedItem.requester_fullname === '') {
    inline = `In line with this, we hereby endorse unto your good office the case of the above-mentioned name`
  } else {
    inline = `In line with this, we hereby endorse unto your good office the case of the ${
      selectedItem.type === 'Funeral Bill' ? 'deceased' : 'patient'
    }`
  }
  if (amount !== '') {
    inline = inline + ` in the amount of `
  }

  return (
    <div
      ref={forwardedRef}
      className="w-full mx-auto px-10 mt-8 text-xs">
      <table className="w-full">
        <thead>
          <LogoHeader />
        </thead>
        <tbody className="text-sm">
          <tr>
            <td
              colSpan={6}
              className="text-center">
              <div className="border border-red-500 border-dashed"></div>
              <div className="border border-red-500 border-dashed mt-px"></div>
              <div className="text-xl underline underline-offset-2 mt-4">
                ENDORSEMENT - NO. {format(new Date(selectedItem.date), 'yy')}
                -AO-000{selectedItem.endorsement_no}
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={6}>
              <div className="mt-6">
                {format(new Date(selectedItem.date), 'dd MMMM yyyy')}
              </div>
              <div className="uppercase mt-6 font-bold">
                RAMIEL A. GUINANDAM
              </div>
              <div className="">SWAD Officer</div>
              <div className="">
                Department of Social Welfare and Development (DSWD)
              </div>
              <div className="">Ozamiz City Field Office</div>
              <div className="mt-6 font-bold">Dear Mr. Guinandam:</div>
              <div className="mt-6">
                <div>
                  <span className="font-bold uppercase">{requester}</span>
                  <span>
                    {' '}
                    sought assistance from the City Mayor for the{' '}
                    <span>{gender_address} </span>
                    <span className="font-bold lowercase">{request}</span>
                    <span className="font-bold uppercase">{patient}.</span>
                  </span>{' '}
                  <span>{inline}</span>
                  <span className="font-bold uppercase">{amount}.</span>
                </div>
                <div className="mt-2">
                  Requesting for favorable action from your office on this
                  matter.
                </div>
                <div className="mt-2 mb-4">
                  Until then, Padayon Asenso Ozamiz!
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={6}>
              <div className="mt-8">By the authority of: </div>
              <div className="mt-6 font-bold">
                ATTY. HENRY &quot;INDY&quot; F. OAMINAL, JR.
              </div>
              <div className="">City Mayor</div>
              <div className="mt-10">Respectfully yours,</div>
              <div className="mt-6 font-bold">CAROLYN N. GO</div>
              <div className="">Executive Assistant V</div>
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
export default PrintEndorsement
