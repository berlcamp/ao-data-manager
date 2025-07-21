/* eslint-disable react/display-name */
'use client'

import { useSupabase } from '@/context/SupabaseProvider'
import { DocumentFlowchartTypes, DocumentTypes } from '@/types'
import { format } from 'date-fns'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  document: DocumentTypes
}

const PrintSlip: React.FC<ChildProps> = ({ forwardedRef, document }) => {
  const [loading, setLoading] = useState(false)
  const [routes, setRoutes] = useState<DocumentFlowchartTypes[] | []>([])

  const { supabase } = useSupabase()

  useEffect(() => {
    // Fetch remarks
    ;(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('adm_tracker_routes')
        .select()
        .neq('title', 'Details updated')
        .eq('tracker_id', document.id)

      setRoutes(data)

      setLoading(false)
    })()
  }, [])
  return (
    <div
      ref={forwardedRef}
      className="w-[2.50in] mx-auto mt-0 text-[10px] leading-tight print:w-[2.83in] print:text-[10px]">
      <table className="w-full text-[10px]">
        <thead>
          <tr>
            <td colSpan={4}>
              <div className="flex justify-between items-start gap-1">
                <Image
                  src="/images/ozamiz.png"
                  width={50}
                  height={50}
                  alt="Ozamiz Logo"
                />
                <div className="text-center leading-snug flex-1">
                  <div className="text-[9px] font-bold">
                    REPUBLIC OF THE PHILIPPINES
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 -mt-1">
                    OFFICE OF THE CITY MAYOR
                  </div>
                  <div className="text-[11px] font-bold -mt-1">
                    CITY OF OZAMIZ
                  </div>
                  <div className="text-[7px] font-bold -mt-1">
                    TELEFAX: (088) 521-1390
                  </div>
                  <div className="text-[7px] font-bold -mt-1">
                    MOBILE: (+63) 910-734-2013
                  </div>
                  <div className="text-[7px] font-bold -mt-1">
                    EMAIL: ASENSOOZAMIZMAYOR@GMAIL.COM
                  </div>
                </div>
                <Image
                  src="/images/ao.png"
                  width={50}
                  height={50}
                  alt="AO Logo"
                />
              </div>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              colSpan={4}
              className="py-1 text-center">
              <span className="text-red-600 font-bold text-[10px]">
                ======================================
              </span>
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <span className="font-semibold">Routing No:</span>{' '}
              {document.routing_slip_no}
            </td>
            <td colSpan={2}>
              <span className="font-semibold">Date:</span>{' '}
              {document.date_received &&
                format(new Date(document.date_received), 'MM/dd/yyyy')}
            </td>
          </tr>
          <tr>
            <td colSpan={4}>
              <span className="font-semibold">Type:</span>{' '}
              {document.particulars}
            </td>
          </tr>
          {document.amount?.trim() && (
            <tr>
              <td colSpan={4}>
                <span className="font-semibold">Amount:</span> {document.amount}
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={4}>
              <span className="font-semibold">From:</span> {document.agency}
            </td>
          </tr>
          <tr>
            <td colSpan={4}>
              <span className="font-semibold">Received By:</span>{' '}
              {document.received_by}
            </td>
          </tr>

          {/* <tr>
            <td
              colSpan={4}
              className="py-1">
              <div className="border border-black"></div>
            </td>
          </tr> */}

          {/* <tr>
        <td colSpan={2}>
          <CheckItem label="Approved" />
          <CheckItem label="For File" />
          <CheckItem label="For Further Instruction" />
        </td>
        <td colSpan={2}>
          <CheckItem label="Disapproved" />
          <CheckItem label="Confidential" />
          <CheckItem label="Others: _________" />
        </td>
      </tr> */}

          <tr>
            <td
              colSpan={4}
              className="py-1">
              <div className="border border-black"></div>
            </td>
          </tr>

          <tr>
            <td
              colSpan={3}
              className="align-top pb-12">
              <span className="font-semibold">Remarks:</span>
            </td>
            <td className="border-l border-black align-top px-1 w-[50px]">
              <span className="font-semibold">Signature</span>
            </td>
          </tr>

          <tr>
            <td
              colSpan={4}
              className="py-1">
              <div className="border border-black"></div>
            </td>
          </tr>

          <tr>
            <td
              colSpan={4}
              className="font-semibold">
              Tracker
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className="text-center border border-black">
              Office
            </td>
            <td className="text-center border border-black">Date</td>
            <td className="text-center border border-black">Sign</td>
          </tr>

          {routes?.map((route, index) => (
            <tr key={index}>
              <td
                colSpan={2}
                className="px-1 border border-black">
                {route.title}
              </td>
              <td className="px-1 border border-black">{route.date}</td>
              <td className="px-1 border border-black">&nbsp;</td>
            </tr>
          ))}

          {/* Add padding rows for signature area */}
          {[...Array(2)].map((_, i) => (
            <tr key={`blank-${i}`}>
              <td
                colSpan={2}
                className="border border-black">
                &nbsp;
              </td>
              <td className="border border-black">&nbsp;</td>
              <td className="border border-black">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default PrintSlip
