/* eslint-disable react/display-name */
'use client'

import { DocumentTypes } from '@/types'
import { format } from 'date-fns'
import Image from 'next/image'
import React from 'react'

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  document: DocumentTypes
}

const PrintSlip: React.FC<ChildProps> = ({ forwardedRef, document }) => {
  return (
    <div
      ref={forwardedRef}
      className="w-[350px] mx-auto mt-8 text-xs">
      <table className="w-full">
        <thead>
          <tr>
            <td colSpan={4}>
              <div className="flex items-start justify-evenly">
                <div>
                  <Image
                    src="/images/ozamiz.png"
                    width={60}
                    height={60}
                    alt="alt"
                    className="mx-auto"
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold">
                    REPUBLIC OF THE PHILIPPINES
                  </div>
                  <div className="text-sm text-blue-600 font-bold -mt-1">
                    OFFICE OF THE CITY MAYOR
                  </div>
                  <div className="text-lg font-bold -mt-1">CITY OF OZAMIZ</div>
                  <div className="text-[8px] font-bold -mt-1">
                    TELEFAX NO: (088) 521-1390
                  </div>
                  <div className="text-[8px] font-bold -mt-2">
                    MOBILE NO: (+63) 910-734-2013
                  </div>
                  <div className="text-[8px] font-bold -mt-2">
                    EMAIL: ASENSOOZAMIZMAYOR@GMAIL.COM
                  </div>
                </div>
                <div>
                  <Image
                    src="/images/ao.png"
                    width={70}
                    height={70}
                    alt="alt"
                    className="mx-auto"
                  />
                </div>
              </div>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              colSpan={4}
              className="py-2">
              <span className="text-red-600 font-bold">
                ===========================================
              </span>
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <span>Routing No: </span>{' '}
              <span className="font-bold">{document.routing_slip_no}</span>
            </td>
            <td colSpan={2}>
              <span>DATE: </span>{' '}
              <span className="font-bold">
                {document.date_received &&
                  format(new Date(document.date_received), 'MM/dd/yyyy')}
              </span>
            </td>
          </tr>
          <tr>
            <td
              colSpan={4}
              className="flex items-center space-x-1">
              <span>Type: </span>
              <span className="font-bold">{document.type}</span>
            </td>
          </tr>
          <tr>
            <td
              colSpan={4}
              className="flex items-center space-x-1">
              <span>Particulars: </span>
              <span className="font-bold">{document.particulars}</span>
            </td>
          </tr>
          {document.amount && document.amount.trim() !== '' && (
            <tr>
              <td
                colSpan={4}
                className="flex items-center space-x-1">
                <span>Amount: </span>
                <span className="font-bold">{document.amount}</span>
              </td>
            </tr>
          )}
          <tr>
            <td
              colSpan={4}
              className="flex items-center space-x-1">
              <span>From: </span>
              <span className="font-bold">{document.agency}</span>
            </td>
          </tr>
          <tr>
            <td
              colSpan={4}
              className="flex items-center space-x-1">
              <span>Received By: </span>
              <span className="font-bold">
                {document.asenso_user.firstname}
              </span>
            </td>
          </tr>
          <tr>
            <td
              colSpan={4}
              className="py-2">
              <div className="border border-black"></div>
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className="space-y-1">
              <div className="flex items-center space-x-1">
                <div className="border w-4 h-4 border-black">&nbsp;</div>
                <div>Approved</div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="border w-4 h-4 border-black">&nbsp;</div>
                <div>For File </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="border w-4 h-4 border-black">&nbsp;</div>
                <div>For Further Instruction</div>
              </div>
            </td>
            <td
              colSpan={2}
              className="space-y-1">
              <div className="flex items-center space-x-1">
                <div className="border w-4 h-4 border-black">&nbsp;</div>
                <div>Disapproved</div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="border w-4 h-4 border-black">&nbsp;</div>
                <div>Confidential</div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="border w-4 h-4 border-black">&nbsp;</div>
                <div>Others: _________</div>
              </div>
            </td>
          </tr>
          <tr>
            <td
              colSpan={4}
              className="py-2">
              <div className="border border-black"></div>
            </td>
          </tr>
          <tr>
            <td
              colSpan={3}
              className="align-top pb-24">
              Remarks:
            </td>
            <td
              colSpan={1}
              className="px-1 w-[50px] align-top border-l border-black">
              Signature
            </td>
          </tr>
          <tr>
            <td
              colSpan={4}
              className="py-2">
              <div className="border border-black"></div>
            </td>
          </tr>
          <tr>
            <td colSpan={4}>Tracker</td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className="text-center border border-black">
              Office
            </td>
            <td
              colSpan={2}
              className="text-center border border-black">
              Date
            </td>
          </tr>
          {document.adm_tracker_routes?.map((item, index) => (
            <tr key={index}>
              <td
                colSpan={2}
                className="px-1 border border-black">
                {item.title}
              </td>
              <td
                colSpan={2}
                className="px-1 border border-black">
                {item.date}
              </td>
            </tr>
          ))}
          <tr>
            <td
              colSpan={2}
              className="border border-black">
              &nbsp;
            </td>
            <td
              colSpan={2}
              className="border border-black">
              &nbsp;
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className="border border-black">
              &nbsp;
            </td>
            <td
              colSpan={2}
              className="border border-black">
              &nbsp;
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
export default PrintSlip
