'use client'

import { updateList } from '@/GlobalRedux/Features/listSlice'
import { CustomButton } from '@/components/index'
import { statusList } from '@/constants/TrackerConstants'
import { useSupabase } from '@/context/SupabaseProvider'
import type { AccountTypes, DocumentRemarksTypes, DocumentTypes } from '@/types'
import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Attachment from './Attachment'
import RemarksList from './RemarksList'

interface ModalProps {
  hideModal: () => void
  handleEdit: (item: DocumentTypes) => void
  documentDataProp: DocumentTypes
}

export default function TrackerModal({
  hideModal,
  handleEdit,
  documentDataProp,
}: ModalProps) {
  //
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { supabase, session, systemUsers } = useSupabase()
  const user: AccountTypes = systemUsers.find(
    (user: AccountTypes) => user.id === session.user.id
  )

  // states
  const [documentData, setDocumentData] = useState(documentDataProp) // create state for document data so we can mutate the data when there is updates in redux
  const [remarks, setRemarks] = useState('')

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const dispatch = useDispatch()

  const handleSubmitRemarks = async () => {
    if (remarks.trim().length === 0) {
      return
    }

    try {
      const newData = {
        tracker_id: documentData.id,
        user_id: session.user.id,
        timestamp: format(new Date(), 'yyyy-MM-dd h:mm a'),
        user: `${user.firstname} ${user.middlename || ''} ${
          user.lastname || ''
        }`,
        remarks: remarks,
      }

      const { error } = await supabase
        .from('adm_tracker_remarks')
        .insert(newData)

      if (error) throw new Error(error.message)

      // Append new data in redux
      const items = [...globallist]
      const updatedData = {
        ...newData,
        id: documentData.id,
        adm_tracker_remarks: [...documentData.adm_tracker_remarks, newData],
      }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))
    } catch (error) {
      console.error(error)
    } finally {
      setRemarks('')
    }
  }

  const getStatusColor = (status: string): string => {
    const statusArr = statusList?.filter((item) => item.status === status)
    if (statusArr.length > 0) {
      return statusArr[0].color
    } else {
      return '#000000'
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      hideModal()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapperRef])

  // Update data whenever list in redux updates
  useEffect(() => {
    const updatedData = globallist.find(
      (item: DocumentTypes) =>
        item.id.toString() === documentDataProp.id.toString()
    )
    setDocumentData(updatedData)
  }, [globallist])

  let rawRemarks: DocumentRemarksTypes[] | [] =
    documentData.adm_tracker_remarks?.length > 0
      ? [...documentData.adm_tracker_remarks] // duplicate the array first in order to mutate it
      : []

  let remarksArray = rawRemarks.length > 0 ? rawRemarks.reverse() : []

  return (
    <>
      <div
        ref={wrapperRef}
        className="app__modal_wrapper">
        <div className="app__modal_wrapper2_large">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="text-md font-bold leading-normal text-gray-800 dark:text-gray-300">
                Tracker
              </h5>
              <div className="flex space-x-2">
                <CustomButton
                  containerStyles="app__btn_blue"
                  title="Edit Details"
                  btnType="button"
                  handleClick={() => handleEdit(documentData)}
                />
                <CustomButton
                  containerStyles="app__btn_gray"
                  title="Close"
                  btnType="button"
                  handleClick={hideModal}
                />
              </div>
            </div>

            <div className="modal-body relative overflow-x-scroll">
              {/* Document Details */}
              <div className="py-2">
                <div className="flex flex-col lg:flex-row w-full items-start justify-between space-x-2 text-xs dark:text-gray-400">
                  <div className="px-4 w-full">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="w-40"></th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-2 font-light text-right">
                            Routing No:
                          </td>
                          <td>
                            <span className="font-medium text-sm">
                              {documentData.routing_slip_no}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 font-light text-right">
                            Type:
                          </td>
                          <td className="text-sm font-medium">
                            {documentData.type}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 font-light text-right">
                            Date Received:
                          </td>
                          <td className="text-sm font-medium">
                            {documentData.date_received &&
                              format(
                                new Date(documentData.date_received),
                                'PPP'
                              )}
                          </td>
                        </tr>
                        {documentData.type === 'Letters' &&
                          documentData.activity_date && (
                            <tr>
                              <td className="px-2 py-2 font-light text-right">
                                Activity Date:
                              </td>
                              <td className="text-sm font-medium">
                                {format(
                                  new Date(documentData.activity_date),
                                  'PPP'
                                )}
                              </td>
                            </tr>
                          )}
                        {documentData.agency && (
                          <tr>
                            <td className="px-2 py-2 font-light text-right">
                              Requesting Department/Agency:
                            </td>
                            <td className="text-sm font-medium">
                              {documentData.agency || ''}
                            </td>
                          </tr>
                        )}
                        {documentData.requester && (
                          <tr>
                            <td className="px-2 py-2 font-light text-right">
                              Requester Name/Payee:
                            </td>
                            <td className="text-sm font-medium">
                              {documentData.requester || ''}
                            </td>
                          </tr>
                        )}
                        {documentData.cheque_no && (
                          <tr>
                            <td className="px-2 py-2 font-light text-right">
                              Cheque No:
                            </td>
                            <td className="text-sm font-medium">
                              {documentData.cheque_no || ''}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="px-2 py-2 font-light text-right align-top">
                            Particulars:
                          </td>
                          <td className="text-sm font-medium">
                            {documentData.particulars}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="px-2 w-full">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="w-40"></th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-2 font-light text-right">
                            Status:
                          </td>
                          <td>
                            <span
                              className="font-medium text-sm"
                              style={{
                                color: `${getStatusColor(documentData.status)}`,
                              }}>
                              {documentData.status}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 font-light text-right">
                            Current Location:
                          </td>
                          <td className="text-sm font-medium">
                            {documentData.location}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 font-light text-right">
                            Attachments:
                          </td>
                          <td className="px-2 pt-2 font-light text-left align-top">
                            <div>
                              {documentData.attachments?.length === 0 && (
                                <span>No attachments</span>
                              )}
                              {documentData.attachments && (
                                <div>
                                  {documentData.attachments?.map(
                                    (file, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center space-x-2 justify-start">
                                        <Attachment
                                          file={file.name}
                                          id={documentData.id}
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <hr />
              <div className="py-2 md:flex">
                <div className="md:w-1/2">
                  <div className="mx-2 px-4 py-4 text-gray-600 bg-gray-100">
                    <div className="mb-6 px-4">
                      <span className="font-bold text-xs">Route Logs</span>
                    </div>
                    <div className="w-full text-xs">
                      {documentData.adm_tracker_routes?.map((item, index) => (
                        <div
                          key={index}
                          className="flex">
                          <div
                            className={`px-4 ${
                              index === 0 ||
                              index + 1 < documentData.adm_tracker_routes.length
                                ? 'border-r-2 border-gray-600 border-dashed'
                                : ''
                            }`}>
                            <div>
                              {format(new Date(item.date), 'dd MMM yyyy')}
                            </div>
                            <div>{item.time}</div>
                          </div>
                          <div className="relative">
                            <span
                              className={`absolute -top-1 ${
                                index === 0 ||
                                index + 1 <
                                  documentData.adm_tracker_routes.length
                                  ? '-left-[11px]'
                                  : '-left-[9px]'
                              } inline-flex items-center justify-center border border-gray-600 rounded-full bg-white w-5 h-5`}>
                              <span className="rounded-full px-1 text-white text-xs"></span>
                            </span>
                          </div>
                          <div
                            className={`${
                              documentData.adm_tracker_routes.length > 1 &&
                              index + 1 < documentData.adm_tracker_routes.length
                                ? 'text-gray-500 font-light'
                                : 'text-gray-700 font-bold'
                            } flex-1 ml-8 pb-4`}>
                            <div>{item.title}</div>
                            <div>{item.message}</div>
                            <div className="font-medium">by {item.user}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="w-full relative">
                    <div className="mx-2 mb-10 outline-none overflow-x-hidden overflow-y-auto text-xs text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                      <div className="flex space-x-2 px-4 py-4">
                        <span className="font-bold">Remarks:</span>
                      </div>
                      {/* Remarks Box */}
                      <div className="w-full flex-col space-y-2 px-4 mb-5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        <textarea
                          onChange={(e) => setRemarks(e.target.value)}
                          value={remarks}
                          placeholder="Write your remarks here.."
                          className="w-full h-20 border resize-none focus:ring-0 focus:outline-none p-2 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        />
                        <div className="flex items-start">
                          <span className="flex-1">&nbsp;</span>

                          <CustomButton
                            containerStyles="app__btn_green"
                            title="Submit"
                            handleClick={handleSubmitRemarks}
                            btnType="button"
                          />
                        </div>
                      </div>
                      {remarksArray.length > 0 ? (
                        remarksArray.map((remarks, idx) => (
                          <RemarksList
                            key={idx}
                            remarks={remarks}
                          />
                        ))
                      ) : (
                        <div className="px-4 pb-4 text-center">
                          No remarks added yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
