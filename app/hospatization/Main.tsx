'use client'

import {
  CustomButton,
  PerPage,
  ShowMore,
  Sidebar,
  TableRowLoading,
  Title,
  TopBar,
  Unauthorized,
} from '@/components/index'
import { superAdmins } from '@/constants/TrackerConstants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { Menu, Transition } from '@headlessui/react'
import React, { Fragment, useEffect, useState } from 'react'
import uuid from 'react-uuid'
import Filters from './Filters'
// Types
import type { MedicalAssistanceTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import AssistanceSidebar from '@/components/Sidebars/AssistanceSidebar'
import {
  ChevronDownIcon,
  PencilSquareIcon,
  PrinterIcon,
} from '@heroicons/react/20/solid'
import axios from 'axios'
import { format } from 'date-fns'
import { useDispatch, useSelector } from 'react-redux'
import AddEditModal from './AddEditModal'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<MedicalAssistanceTypes[]>([])

  const [showAddModal, setShowAddModal] = useState(false)
  const [editData, setEditData] = useState<MedicalAssistanceTypes | null>(null)

  const [filterBillType, setFilterBillType] = useState('All')
  const [filterHospital, setFilterHospital] = useState('All')
  const [filterDateRequested, setFilterDateRequested] = useState<
    Date | undefined
  >(undefined)
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>(
    undefined
  )
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>(undefined)
  const [filterKeyword, setFilterKeyword] = useState('')

  const [perPageCount, setPerPageCount] = useState<number>(10)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { session } = useSupabase()
  const { hasAccess } = useFilter()

  const apiUrl = process.env.NEXT_PUBLIC_AO_API_URL ?? ''

  const fetchData = async () => {
    setLoading(true)

    const params = {
      filterKeyword,
      filterHospital,
      filterBillType,
      filterDateRequested,
      filterDateFrom,
      filterDateTo,
      take: perPageCount,
      skip: 0,
    }

    try {
      await axios.get(`${apiUrl}/aoassist`, { params }).then((response) => {
        // update the list in redux
        dispatch(updateList(response.data.data))

        // Updating showing text in redux
        dispatch(
          updateResultCounter({
            showing: response.data.data.length,
            results: response.data.total_results,
          })
        )
      })
    } catch (error) {
      console.error('error', error)
    }

    setLoading(false)
  }

  const handleShowMore = async () => {
    setLoading(true)

    const params = {
      filterKeyword,
      filterHospital,
      filterBillType,
      filterDateRequested,
      filterDateFrom,
      filterDateTo,
      take: perPageCount,
      skip: resultsCounter.showing,
    }

    try {
      await axios.get(`${apiUrl}/aoassist`, { params }).then((response) => {
        // update the list in redux
        const newList = [...list, ...response.data.data]
        dispatch(updateList(newList))

        // Updating showing text in redux
        dispatch(
          updateResultCounter({
            showing: newList.length,
            results: response.data.total_results,
          })
        )
      })
    } catch (error) {
      console.error('error', error)
    }

    setLoading(false)
  }

  const handleAdd = () => {
    setShowAddModal(true)
    setEditData(null)
  }

  const handleEdit = (item: MedicalAssistanceTypes) => {
    setShowAddModal(true)
    setEditData(item)
  }

  const handleApprove = (id: string) => {
    //
  }

  const handleDisapprove = (id: string) => {
    //
  }

  const handleReset = (id: string) => {
    //
  }

  // Update list whenever list in redux updates
  useEffect(() => {
    setList(globallist)
  }, [globallist])

  // Fetch data
  useEffect(() => {
    setList([])
    void fetchData()
  }, [
    filterKeyword,
    perPageCount,
    filterBillType,
    filterHospital,
    filterDateRequested,
    filterDateFrom,
    filterDateTo,
  ])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (!hasAccess('hospatization') && !superAdmins.includes(session.user.email))
    return <Unauthorized />

  return (
    <>
      <Sidebar>
        <AssistanceSidebar />
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="AO Free Hospitalization Program" />
            <CustomButton
              containerStyles="app__btn_green"
              title="Add New Record"
              btnType="button"
              handleClick={handleAdd}
            />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterBillType={setFilterBillType}
              setFilterHospital={setFilterHospital}
              setFilterDateRequested={setFilterDateRequested}
              setFilterDateFrom={setFilterDateFrom}
              setFilterDateTo={setFilterDateTo}
              setFilterKeyword={setFilterKeyword}
            />
          </div>

          {/* Per Page */}
          <PerPage
            showingCount={resultsCounter.showing}
            resultsCount={resultsCounter.results}
            perPageCount={perPageCount}
            setPerPageCount={setPerPageCount}
          />

          {/* Main Content */}
          <div>
            <table className="app__table">
              <thead className="app__thead">
                <tr>
                  <th className="hidden md:table-cell app__th pl-4"></th>
                  <th className="hidden md:table-cell app__th">Patient</th>
                  <th className="hidden md:table-cell app__th">Status</th>
                  <th className="hidden md:table-cell app__th">
                    Date Requested
                  </th>
                  <th className="hidden md:table-cell app__th">
                    Date Approved
                  </th>
                  <th className="hidden md:table-cell app__th">Request Type</th>
                  <th className="hidden md:table-cell app__th">
                    Granted Amount
                  </th>
                  <th className="hidden md:table-cell app__th">Address</th>
                </tr>
              </thead>
              <tbody>
                {!isDataEmpty &&
                  list.map((item: MedicalAssistanceTypes) => (
                    <tr
                      key={uuid()}
                      className="app__tr">
                      <td className="w-6 pl-4 app__td">
                        <Menu
                          as="div"
                          className="app__menu_container">
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
                            <Menu.Items className="app__dropdown_items">
                              <div className="py-1">
                                <Menu.Item>
                                  <div
                                    onClick={() => handleEdit(item)}
                                    className="app__dropdown_item">
                                    <PencilSquareIcon className="w-4 h-4" />
                                    <span>Edit</span>
                                  </div>
                                </Menu.Item>
                                {item.status === 'Approved' && (
                                  <Menu.Item>
                                    <div className="app__dropdown_item">
                                      <PrinterIcon className="w-4 h-4" />
                                      <span>Print GL</span>
                                    </div>
                                  </Menu.Item>
                                )}
                                {(item.status === 'Approved' ||
                                  item.status === 'Disapproved') && (
                                  <>
                                    <Menu.Item>
                                      <div className="app__dropdown_item2">
                                        <CustomButton
                                          containerStyles="app__btn_orange_xs"
                                          title="Change to For Evaluation"
                                          btnType="button"
                                          handleClick={() =>
                                            handleReset(item.id)
                                          }
                                        />
                                      </div>
                                    </Menu.Item>
                                  </>
                                )}
                                <Menu.Item>
                                  <div className="app__dropdown_item2">
                                    {(item.status === 'For Evaluation' ||
                                      item.status === 'Charged To MAIP') && (
                                      <>
                                        <CustomButton
                                          containerStyles="app__btn_green_xs"
                                          title="Approve"
                                          btnType="button"
                                          handleClick={() =>
                                            handleApprove(item.id)
                                          }
                                        />
                                        <CustomButton
                                          containerStyles="app__btn_red_xs"
                                          title="Disapprove"
                                          btnType="button"
                                          handleClick={() =>
                                            handleDisapprove(item.id)
                                          }
                                        />
                                      </>
                                    )}
                                  </div>
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <th className="app__th_firstcol">
                        <div>{item.fullname}</div>
                        {/* <div className='text-xs text-gray-500'>ID: {item.id}</div> */}
                        {item.status === 'Approved' && (
                          <>
                            <div className="text-xs text-gray-500">
                              GL No: {item.guarantee_no_text}
                            </div>
                          </>
                        )}
                        {/* Mobile View */}
                        <div>
                          <div className="md:hidden app__td_mobile">
                            <div>
                              {item.status === 'Approved' ? (
                                <span className="app__status_container_green">
                                  {item.status}
                                </span>
                              ) : (
                                <span className="app__status_container_orange">
                                  {item.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* End - Mobile View */}
                      </th>
                      <td className="hidden md:table-cell app__td">
                        <div className="flex space-x-1 items-center">
                          {item.status === 'Approved' && (
                            <span className="app__status_container_green">
                              {item.status}
                            </span>
                          )}
                          {item.status === 'For Evaluation' && (
                            <span className="app__status_container_orange">
                              {item.status}
                            </span>
                          )}
                          {item.status === 'Charged To MAIP' && (
                            <span className="app__status_container_blue">
                              Charged&nbsp;To&nbsp;MAIP
                            </span>
                          )}
                          {item.status === 'Approved and Charged to LGU' && (
                            <div>
                              <div>
                                <span className="app__status_container_blue">
                                  {item.status}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold">Reason:</span>{' '}
                                <span>{item.reason}</span>
                              </div>
                            </div>
                          )}
                          {item.status === 'Disapproved' && (
                            <div>
                              <div>
                                <span className="app__status_container_red">
                                  {item.status}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold">Reason:</span>{' '}
                                <span>{item.reason}</span>
                              </div>
                            </div>
                          )}
                          {item.lgu_amount !== '' && (
                            <span className="app__status_container_blue">
                              Charged an Amount to LGU
                            </span>
                          )}
                          {item.from_lgu === 'Yes' && (
                            <span className="app__status_container_blue">
                              From&nbsp;LGU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.date && item.date !== '' ? (
                          <span>
                            {format(new Date(item.date), 'MMM dd, yyyy')}
                          </span>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.date_approved && item.date_approved !== '' ? (
                          <span>
                            {format(
                              new Date(item.date_approved),
                              'MMM dd, yyyy'
                            )}
                          </span>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.request_type}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        <div className="font-medium">{item.granted_amount}</div>
                        {item.lgu_amount !== '' && (
                          <div>LGU: {item.lgu_amount}</div>
                        )}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.patient_barangay?.barangay},{' '}
                        {item.patient_barangay?.municipality}
                      </td>
                    </tr>
                  ))}
                {loading && (
                  <TableRowLoading
                    cols={7}
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
          {resultsCounter.results > resultsCounter.showing && !loading && (
            <ShowMore handleShowMore={handleShowMore} />
          )}
        </div>
      </div>
      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddEditModal
          editData={editData}
          hideModal={() => setShowAddModal(false)}
        />
      )}
    </>
  )
}
export default Page
