'use client'

import {
  ArchiveModal,
  CustomButton,
  PerPage,
  ShowMore,
  Sidebar,
  TableRowLoading,
  Title,
  TopBar,
  TrackerSideBar,
  Unauthorized,
} from '@/components/index'
import { fetchActivities, fetchDocuments } from '@/utils/fetchApi'
import { Menu, Transition } from '@headlessui/react'
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  PencilIcon,
  StarIcon,
} from '@heroicons/react/20/solid'
import { format } from 'date-fns'
import React, { Fragment, useEffect, useState } from 'react'
import ActivitiesModal from './ActivitiesModal'
import AddDocumentModal from './AddDocumentModal'
import Filters from './Filters'

// Types
import type { AccountTypes, DocumentTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import {
  docRouting,
  statusList,
  superAdmins,
} from '@/constants/TrackerConstants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { CheckIcon, ChevronDown, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Tooltip } from 'react-tooltip'
import AddStickyModal from './AddStickyModal'
import DownloadExcelButton from './DownloadExcel'
import PrintButton from './PrintButton'
import StickiesModal from './StickiesModal'
import TrackerModal from './TrackerModal'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showStickiesModal, setShowStickiesModal] = useState(false)
  const [showAddStickyModal, setShowAddStickyModal] = useState(false)
  const [viewActivity, setViewActivity] = useState(false)
  const [viewTrackerModal, setViewTrackerModal] = useState(false)

  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<DocumentTypes | null>(null)
  const [activitiesData, setActivitiesData] = useState<DocumentTypes[]>([])

  // Filters
  const [filterTypes, setFilterTypes] = useState<any[] | []>([])
  const [filterStatus, setFilterStatus] = useState('')
  const [filterKeyword, setFilterKeyword] = useState('')
  const [filterCurrentRoute, setFilterCurrentRoute] = useState('')
  const [filterRoute, setFilterRoute] = useState('')
  const [filterDateForwarded, setFilterDateForwarded] = useState<
    Date | undefined
  >(undefined)

  // List
  const [list, setList] = useState<DocumentTypes[]>([])
  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [showingCount, setShowingCount] = useState<number>(0)
  const [resultsCount, setResultsCount] = useState<number>(0)

  const { supabase, session, systemUsers } = useSupabase()
  const { hasAccess, setToast } = useFilter()

  const user: AccountTypes = systemUsers.find(
    (user: AccountTypes) => user.id === session.user.id
  )

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchDocuments(
        {
          filterTypes,
          filterKeyword,
          filterStatus,
          filterCurrentRoute,
          filterRoute,
          filterDateForwarded,
        },
        perPageCount,
        0
      )

      // update the list in redux
      dispatch(updateList(result.data))

      setResultsCount(result.count ? result.count : 0)
      setShowingCount(result.data.length)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Append data to existing list whenever 'show more' button is clicked
  const handleShowMore = async () => {
    setLoading(true)

    try {
      const result = await fetchDocuments(
        {
          filterTypes,
          filterKeyword,
          filterStatus,
          filterCurrentRoute,
          filterRoute,
          filterDateForwarded,
        },
        perPageCount,
        list.length
      )

      // update the list in redux
      const newList = [...list, ...result.data]
      dispatch(updateList(newList))

      setResultsCount(result.count ? result.count : 0)
      setShowingCount(newList.length)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setShowAddModal(true)
    setSelectedItem(null)
  }

  const handleMigrate = async () => {
    try {
      let eof = false
      // let lastId = 118207
      let lastId = 124207

      while (!eof) {
        const { data, error } = await supabase
          .from('document_trackers')
          .select('*, document_tracker_replies(*)', { count: 'exact' })
          .gt('id', lastId)
          .limit(100)

        if (error) {
          throw new Error(error.message)
        }

        // insert array
        const insertArray: any[] = []
        const remarksInsertArray: any = []
        const routesInsertArray: any = []

        if (data && data.length > 0) {
          console.log(
            'Migration length: ' + data.length,
            'last id: ',
            data[data.length - 1].id
          )
          lastId = data[data.length - 1].id

          data.forEach((dataItem: any) => {
            let status = 'Open'
            let route = 'Received at OCM'
            if (dataItem.status === 'Approved') {
              status = 'Approved'
            } else if (dataItem.status === 'For File') {
              status = 'For File'
            } else if (dataItem.status === 'Disapproved') {
              status = 'Disapproved'
            } else if (dataItem.status === 'For Further Instruction') {
              status = 'For Further Instruction'
            } else if (dataItem.status === 'Cancelled') {
              status = 'Cancelled'
            } else if (dataItem.status === 'Resolved') {
              status = 'Resolved'
            }

            if (dataItem.route === 'Received at OCM') {
              route = 'Received at OCM'
            } else if (dataItem.status === 'Received at CADM') {
              route = 'Received at CADM'
            } else if (dataItem.status === 'Forwarded') {
              route = 'Forwarded'
            } else if (dataItem.status === 'Forwarded to Atty Rhea') {
              route = 'Forwarded to Atty Rhea'
            } else if (dataItem.status === 'Forwarded to CADM') {
              route = 'Forwarded to CADM'
            }

            const parsedActivityDate = Date.parse(dataItem.activity_date)

            insertArray.push({
              id: dataItem.id,
              date_received: dataItem.date,
              time_received: dataItem.time,
              routing_slip_no: dataItem.routing_slip_no,
              routing_no: dataItem.routing_no,
              type: dataItem.type,
              agency: dataItem.agency,
              requester: dataItem.name,
              particulars: dataItem.particulars,
              amount: dataItem.amount,
              status: status,
              received_from: dataItem.received_from,
              received_by: dataItem.received_by,
              activity_date:
                !isNaN(parsedActivityDate) && isFinite(parsedActivityDate)
                  ? format(new Date(dataItem.activity_date), 'yyyy-MM-dd')
                  : null,
              location: route,
              contact_number: dataItem.contact_number,
              user_id: dataItem.user_id,
            })

            routesInsertArray.push({
              date: dataItem.date,
              time: dataItem.time,
              user: dataItem.received_by,
              title: route,
              tracker_id: dataItem.id,
              user_id: dataItem.user_id,
            })

            dataItem.document_tracker_replies?.map((remarks: any) => {
              if (remarks.reply_type !== 'system') {
                remarksInsertArray.push({
                  user_id: remarks.sender_id,
                  tracker_id: remarks.document_tracker_id,
                  timestamp: format(
                    new Date(remarks.created_at),
                    'yyyy-MM-dd h:mm a'
                  ),
                  user:
                    systemUsers.find(
                      (user: AccountTypes) => user.id === remarks.sender_id
                    )?.firstname || 'User',
                  remarks: remarks.message,
                })
              }
            })
          })

          // Insert data to db
          const { error: error2 } = await supabase
            .from('adm_trackers')
            .insert(insertArray)
          if (error2) {
            throw new Error(error2.message)
          }

          const { error: error3 } = await supabase
            .from('adm_tracker_remarks')
            .insert(remarksInsertArray)
          if (error3) {
            throw new Error(error3.message)
          }

          const { error: error4 } = await supabase
            .from('adm_tracker_routes')
            .insert(routesInsertArray)
          if (error4) {
            throw new Error(error4.message)
          }

          console.log('inserted remarksInsertArray')
          console.log('inserted insertArray')
          console.log('inserted routesArray')
        } else {
          eof = true
          console.log('eof')
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleArchive = (id: string) => {
    setSelectedId(id)
    setShowArchiveModal(true)
  }

  const handleChangeStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('adm_trackers')
      .update({ status })
      .eq('id', id)

    // Append new data in redux
    const items = [...globallist]
    const updatedData = {
      status,
      id,
    }
    const foundIndex = items.findIndex((x) => x.id === updatedData.id)
    items[foundIndex] = { ...items[foundIndex], ...updatedData }
    dispatch(updateList(items))

    // pop up the success message
    setToast('success', 'Successfully Saved.')
  }
  const handleChangeLocation = async (
    item: DocumentTypes,
    location: string
  ) => {
    try {
      const { error } = await supabase
        .from('adm_trackers')
        .update({ location })
        .eq('id', item.id)

      if (error) throw new Error(error.message)

      // Add tracker route logs
      const trackerRoutes = {
        tracker_id: item.id,
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'h:mm a'),
        user_id: session.user.id,
        user: `${user.firstname} ${user.middlename || ''} ${
          user.lastname || ''
        }`,
        title: location,
        message: '',
      }
      const { error: error2 } = await supabase
        .from('adm_tracker_routes')
        .insert(trackerRoutes)

      if (error2) throw new Error(error2.message)

      // Append new data in redux
      const items = [...globallist]
      const updatedData = {
        location,
        id: item.id,
        adm_tracker_routes: [...item.adm_tracker_routes, trackerRoutes],
      }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      // pop up the success message
      setToast('success', 'Successfully Saved.')
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (item: DocumentTypes) => {
    setShowAddModal(true)
    setSelectedItem(item)
  }

  const handleViewActivities = () => {
    setViewActivity(true)
  }

  const getStatusColor = (status: string): string => {
    const statusArr = statusList.filter((item) => item.status === status)
    if (statusArr.length > 0) {
      return statusArr[0].color
    } else {
      return '#000000'
    }
  }

  // Upcoming activities
  const fetchActivitiesData = async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const today2 = new Date()
    const endDate = new Date()
    endDate.setDate(today2.getDate() + 60)

    const result = await fetchActivities(today, endDate)

    setActivitiesData(result.data)
  }

  // Update list whenever list in redux updates
  useEffect(() => {
    setList(globallist)
    void fetchActivitiesData()
  }, [globallist])

  // Featch data
  useEffect(() => {
    setList([])
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterKeyword,
    filterStatus,
    filterTypes,
    filterCurrentRoute,
    filterRoute,
    filterDateForwarded,
    perPageCount,
  ])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list
  const email: string = session.user.email

  // Check access from permission settings or Super Admins
  if (!hasAccess('request_tracker') && !superAdmins.includes(email))
    return <Unauthorized />

  return (
    <>
      <Sidebar>
        <TrackerSideBar />
      </Sidebar>
      <div className="app__main">
        <div>
          {/* Header */}
          <TopBar />
          <div className="app__title">
            <Title title="Document Tracker" />
            {/* Download Excel */}
            {!isDataEmpty && (
              <div className="hidden md:flex items-center">
                <DownloadExcelButton
                  filters={{
                    filterKeyword,
                    filterStatus,
                    filterTypes,
                    filterCurrentRoute,
                    filterRoute,
                    filterDateForwarded,
                  }}
                />
              </div>
            )}
            <StarIcon
              onClick={() => setShowStickiesModal(true)}
              className="cursor-pointer w-7 h-7 text-yellow-500"
              data-tooltip-id="stickies-tooltip"
              data-tooltip-content="Starred"
            />
            <Tooltip
              id="stickies-tooltip"
              place="bottom-end"
            />
            <CalendarDaysIcon
              onClick={handleViewActivities}
              className="cursor-pointer w-7 h-7"
              data-tooltip-id="calendar-tooltip"
              data-tooltip-content="Upcoming Activities"
            />
            <Tooltip
              id="calendar-tooltip"
              place="bottom-end"
            />
            <CustomButton
              containerStyles="app__btn_green"
              title="Add New Document"
              btnType="button"
              handleClick={handleAdd}
            />
            <CustomButton
              containerStyles="app__btn_green"
              title="Migrate"
              btnType="button"
              handleClick={handleMigrate}
            />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterTypes={setFilterTypes}
              setFilterStatus={setFilterStatus}
              setFilterKeyword={setFilterKeyword}
              setFilterCurrentRoute={setFilterCurrentRoute}
              setFilterRoute={setFilterRoute}
              setFilterDateForwarded={setFilterDateForwarded}
            />
          </div>

          {/* Per Page */}
          <PerPage
            showingCount={showingCount}
            resultsCount={resultsCount}
            perPageCount={perPageCount}
            setPerPageCount={setPerPageCount}
          />

          {/* Main Content */}
          <div>
            <table className="app__table">
              <thead className="app__thead">
                <tr>
                  <th className="app__th w-14"></th>
                  <th className="app__th">Details</th>
                  <th className="hidden md:table-cell app__th">
                    Recent Remarks
                  </th>
                  <th className="hidden md:table-cell app__th">
                    Current Route
                  </th>
                  <th className="hidden md:table-cell app__th">Status</th>
                </tr>
              </thead>
              <tbody>
                {!isDataEmpty &&
                  list.map((item: DocumentTypes, index: number) => (
                    <tr
                      key={index}
                      className="app__tr">
                      <td className="app__td">
                        <Menu
                          as="div"
                          className="app__menu_container font-normal text-gray-600">
                          <div>
                            <Menu.Button className="app__dropdown_btn">
                              <ChevronDown
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </Menu.Button>
                          </div>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95">
                            <Menu.Items className="absolute left-0 z-30 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="py-1">
                                <Menu.Item>
                                  <div
                                    onClick={() => {
                                      setShowAddStickyModal(true)
                                      setSelectedItem(item)
                                    }}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 text-gray-700 hover:text-gray-900 px-4 py-2 text-xs">
                                    <StarIcon className="cursor-pointer outline-none w-6 h-6 text-yellow-500" />
                                    <span>Add to Starred</span>
                                  </div>
                                </Menu.Item>
                                <Menu.Item>
                                  <div
                                    onClick={() => handleEdit(item)}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 text-gray-700 hover:text-gray-900 px-4 py-2 text-xs">
                                    <PencilIcon className="cursor-pointer outline-none w-6 h-6 text-green-500" />
                                    <span>Edit Details</span>
                                  </div>
                                </Menu.Item>
                                <Menu.Item>
                                  <div
                                    onClick={() => handleArchive(item.id)}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 text-gray-700 hover:text-gray-900 px-4 py-2 text-xs">
                                    <Trash2 className="cursor-pointer outline-none w-6 h-6 text-red-500" />
                                    <span>Move To Archive</span>
                                  </div>
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <td className="app__td">
                        <div className="space-y-2">
                          <div>
                            <span className="font-light">Type:</span>{' '}
                            <span className="font-medium">{item.type}</span>
                            {item.type === 'Other Documents' && (
                              <span className="font-medium mt-1">
                                {item.specify}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-light">Requester:</span>{' '}
                            <span className="font-medium">
                              {item.requester}
                            </span>
                          </div>
                          <div>
                            <span className="font-light">Received:</span>{' '}
                            <span className="font-medium">
                              {format(
                                new Date(item.date_received),
                                'MMMM dd, yyyy'
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="font-light">Particulars:</span>{' '}
                            <span className="font-medium">
                              {item.particulars.length > 50 ? (
                                <span>
                                  {item.particulars.substring(0, 50 - 3)}...
                                  <span
                                    className="cursor-pointer text-blue-500"
                                    onClick={() => {
                                      setSelectedItem(item)
                                      setViewTrackerModal(true)
                                    }}>
                                    See More
                                  </span>
                                </span>
                              ) : (
                                <span>{item.particulars}</span>
                              )}
                            </span>
                          </div>
                          {item.attachments && (
                            <div>
                              <span className="font-medium">
                                {item.attachments?.length} attachments
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <PrintButton document={item} />
                            <CustomButton
                              containerStyles="app__btn_green_xs"
                              title="View Details"
                              btnType="button"
                              handleClick={() => {
                                setSelectedItem(item)
                                setViewTrackerModal(true)
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.adm_tracker_remarks?.length > 0 && (
                          <div className="space-x-1 font-medium">
                            <span>
                              {
                                item.adm_tracker_remarks[
                                  item.adm_tracker_remarks.length - 1
                                ].user
                              }
                              :{' '}
                              {
                                item.adm_tracker_remarks[
                                  item.adm_tracker_remarks.length - 1
                                ].remarks
                              }
                            </span>
                            <span
                              className="cursor-pointer text-blue-500"
                              onClick={() => {
                                setSelectedItem(item)
                                setViewTrackerModal(true)
                              }}>
                              View All
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        <div className="flex items-center">
                          <span className="font-bold">{item.location}</span>
                          <Menu
                            as="div"
                            className="app__menu_container font-normal text-gray-600">
                            <div>
                              <Menu.Button className="app__dropdown_btn">
                                <ChevronDownIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </Menu.Button>
                            </div>

                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95">
                              <Menu.Items className="absolute right-0 z-30 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                  {docRouting.map((route, idx) => (
                                    <Menu.Item key={idx}>
                                      <div
                                        onClick={() =>
                                          handleChangeLocation(item, route)
                                        }
                                        className="flex items-center justify-between space-x-2 cursor-pointer hover:bg-gray-100 text-gray-700 hover:text-gray-900 px-4 py-2 text-xs">
                                        <span>{route}</span>
                                        {route === item.location && (
                                          <CheckIcon className="w-4 h-4" />
                                        )}
                                      </div>
                                    </Menu.Item>
                                  ))}
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      </td>
                      <td className="hidden md:table-cell app__td">
                        <div className="flex items-center">
                          <span
                            className="font-bold"
                            style={{ color: getStatusColor(item.status) }}>
                            {item.status}
                          </span>
                          <Menu
                            as="div"
                            className="app__menu_container font-normal text-gray-600">
                            <div>
                              <Menu.Button className="app__dropdown_btn">
                                <ChevronDownIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </Menu.Button>
                            </div>

                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95">
                              <Menu.Items className="absolute right-0 z-30 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                  {statusList.map((i, idx) => (
                                    <Menu.Item key={idx}>
                                      <div
                                        onClick={() =>
                                          handleChangeStatus(item.id, i.status)
                                        }
                                        className="flex items-center justify-between space-x-2 cursor-pointer hover:bg-gray-100 text-gray-700 hover:text-gray-900 px-4 py-2 text-xs">
                                        <span>{i.status}</span>
                                        {i.status === item.status && (
                                          <CheckIcon className="w-4 h-4" />
                                        )}
                                      </div>
                                    </Menu.Item>
                                  ))}
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      </td>
                    </tr>
                  ))}
                {loading && (
                  <TableRowLoading
                    cols={5}
                    rows={2}
                  />
                )}
              </tbody>
            </table>
            {!loading && isDataEmpty && (
              <div className="app__norecordsfound">No records found.</div>
            )}
          </div>

          {/* Show More */}
          {resultsCount > showingCount && !loading && (
            <ShowMore handleShowMore={handleShowMore} />
          )}

          {/* Confirm Move to Archive Modal */}
          {showArchiveModal && (
            <ArchiveModal
              table="adm_trackers"
              selectedId={selectedId}
              showingCount={showingCount}
              setShowingCount={setShowingCount}
              resultsCount={resultsCount}
              setResultsCount={setResultsCount}
              hideModal={() => setShowArchiveModal(false)}
            />
          )}

          {/* Activities Modal */}
          {viewActivity && (
            <ActivitiesModal
              activitiesData={activitiesData}
              hideModal={() => setViewActivity(false)}
            />
          )}

          {/* Tracker Modal */}
          {viewTrackerModal && selectedItem && (
            <TrackerModal
              handleEdit={handleEdit}
              documentDataProp={selectedItem}
              hideModal={() => setViewTrackerModal(false)}
            />
          )}

          {/* Stickies Modal */}
          {showStickiesModal && (
            <StickiesModal hideModal={() => setShowStickiesModal(false)} />
          )}

          {/* Add to Sticky Modal */}
          {showAddStickyModal && (
            <AddStickyModal
              item={selectedItem}
              hideModal={() => setShowAddStickyModal(false)}
            />
          )}
          {/* Add Document Modal */}
          {showAddModal && (
            <AddDocumentModal
              editData={selectedItem}
              hideModal={() => setShowAddModal(false)}
            />
          )}
        </div>
      </div>
    </>
  )
}
export default Page
