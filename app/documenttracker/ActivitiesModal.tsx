'use client'

import DetailsModal from '@/components/DetailsModal'
import { CustomButton } from '@/components/index'
import type { DocumentTypes } from '@/types'
import { CalendarDaysIcon } from '@heroicons/react/20/solid'
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import { useEffect, useRef, useState } from 'react'

interface ModalProps {
  hideModal: () => void
  activitiesData: DocumentTypes[]
}

type ViewMode = 'list' | 'month' | 'week'

export default function ActivitiesModal({
  hideModal,
  activitiesData,
}: ModalProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)

  const handleClose = () => setSelectedEvent(null)

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') hideModal()
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Filter events per date
  const getEventsForDate = (date: Date) => {
    return activitiesData.filter((item) =>
      isSameDay(new Date(item.activity_date), date)
    )
  }

  // Navigation
  const goPrev = () => {
    if (view === 'month') setCurrentDate((d) => subMonths(d, 1))
    else if (view === 'week') setCurrentDate((d) => subWeeks(d, 1))
  }

  const goNext = () => {
    if (view === 'month') setCurrentDate((d) => addMonths(d, 1))
    else if (view === 'week') setCurrentDate((d) => addWeeks(d, 1))
  }

  // Generate days for month view
  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  })

  // Generate days for week view
  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate),
    end: endOfWeek(currentDate),
  })

  return (
    <div
      ref={wrapperRef}
      className="app__modal_wrapper">
      <div className="app__modal_wrapper2_large">
        <div className="app__modal_wrapper3">
          {/* HEADER */}
          <div className="app__modal_header flex items-center justify-between">
            <h5 className="text-md font-bold leading-normal text-gray-800 dark:text-gray-300">
              Upcoming Activities
            </h5>
            <div className="flex space-x-2">
              <CustomButton
                containerStyles={
                  view === 'list' ? 'app__btn_blue' : 'app__btn_gray'
                }
                title="List View"
                btnType="button"
                handleClick={() => setView('list')}
              />
              <CustomButton
                containerStyles={
                  view === 'month' ? 'app__btn_blue' : 'app__btn_gray'
                }
                title="Month View"
                btnType="button"
                handleClick={() => setView('month')}
              />
              <CustomButton
                containerStyles={
                  view === 'week' ? 'app__btn_blue' : 'app__btn_gray'
                }
                title="Week View"
                btnType="button"
                handleClick={() => setView('week')}
              />
              <CustomButton
                containerStyles="app__btn_gray"
                title="Close"
                btnType="button"
                handleClick={hideModal}
              />
            </div>
          </div>

          {/* BODY */}
          <div className="modal-body relative p-4 overflow-x-scroll">
            {view === 'list' && (
              <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                <thead className="text-xs border-b uppercase bg-gray-100 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="py-2 px-2 w-32">Type</th>
                    <th className="py-2 px-2">Activity&nbsp;Date</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Particulars</th>
                  </tr>
                </thead>
                <tbody>
                  {activitiesData?.length === 0 && (
                    <tr className="bg-gray-50 text-xs border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="py-2 pl-4">No records found.</td>
                    </tr>
                  )}
                  {activitiesData?.map((item, index) => (
                    <tr
                      key={index}
                      className="bg-gray-50 text-xs border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-gray-600">
                      <th className="py-2 px-2 text-gray-900 dark:text-white">
                        <div className="font-semibold">{item.type}</div>
                      </th>
                      <td className="py-2 px-2">
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon className="w-5 h-5" />
                          <span>
                            {format(
                              new Date(item.activity_date),
                              'dd MMM yyyy'
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2">{item.status}</td>
                      <td className="py-2 px-2">{item.particulars}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {view === 'month' && (
              <div>
                <h6 className="text-center font-semibold mb-2">
                  {format(currentDate, 'MMMM yyyy')}
                </h6>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {monthDays.map((day, i) => (
                    <div
                      key={i}
                      className="border p-1 h-24 overflow-y-auto">
                      <div className="font-bold">{format(day, 'd')}</div>

                      {getEventsForDate(day).map((evt) => (
                        <div
                          key={evt.id}
                          className="bg-amber-100 text-amber-800 rounded px-1 mt-1 truncate cursor-pointer"
                          onClick={() => setSelectedEvent(evt)}>
                          {evt.type} ({evt.status})
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'week' && (
              <div>
                <h6 className="text-center font-semibold mb-2">
                  Week of {format(startOfWeek(currentDate), 'dd MMM')} -{' '}
                  {format(endOfWeek(currentDate), 'dd MMM yyyy')}
                </h6>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {weekDays.map((day, i) => (
                    <div
                      key={i}
                      className="border p-1 h-32 overflow-y-auto">
                      <div className="font-bold">{format(day, 'EEE d')}</div>
                      {getEventsForDate(day).map((evt, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-100 text-blue-800 rounded px-1 mt-1 truncate cursor-pointer"
                          onClick={() => setSelectedEvent(evt)}>
                          {evt.type} ({evt.status})
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Show modal if an event is selected */}
            {selectedEvent && (
              <DetailsModal
                header={selectedEvent.type}
                message={
                  <div className="space-y-4">
                    <div>
                      <span className="font-bold">Date:</span>{' '}
                      {format(
                        new Date(selectedEvent.activity_date),
                        'dd MMM yyyy'
                      )}
                    </div>
                    <div>
                      <span className="font-bold">Requester:</span>{' '}
                      {selectedEvent.requester}
                    </div>
                    <div>
                      <span className="font-bold">Status:</span>{' '}
                      {selectedEvent.status}
                    </div>
                    <div>
                      <span className="font-bold">Particulars:</span>{' '}
                      {selectedEvent.particulars}
                    </div>
                  </div>
                }
                onCancel={handleClose}
              />
            )}
          </div>
          <div className="flex justify-center space-x-2 my-4">
            <CustomButton
              containerStyles="app__btn_green"
              title="Prev"
              btnType="button"
              handleClick={goPrev}
            />
            <CustomButton
              containerStyles="app__btn_green"
              title="Next"
              btnType="button"
              handleClick={goNext}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
