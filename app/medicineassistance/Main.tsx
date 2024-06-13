'use client'

import {
  CustomButton,
  DeleteModal,
  PerPage,
  ShowMore,
  Sidebar,
  TableRowLoading,
  Title,
  TopBar,
  Unauthorized,
} from '@/components/index'
import { pharmacyList, superAdmins } from '@/constants/TrackerConstants'
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
import AssistanceSidebar from '@/components/Sidebars/AssistanceSidebar'
import { fetchMedicineClients } from '@/utils/fetchApi'
import { ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/20/solid'
import { format } from 'date-fns'
import { TrashIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import AddEditModal from './AddEditModal'
import PrintGLButton from './PrintGLButton'
import PrintSummaryButton from './PrintSummaryButton'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)

  // List
  const [list, setList] = useState<MedicalAssistanceTypes[]>([])
  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [showingCount, setShowingCount] = useState<number>(0)
  const [resultsCount, setResultsCount] = useState<number>(0)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editData, setEditData] = useState<MedicalAssistanceTypes | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')

  // Filters
  // const [filterBillType, setFilterBillType] = useState('All')
  const [filterPharmacy, setFilterPharmacy] = useState('All')
  const [filterDateRequested, setFilterDateRequested] = useState<
    Date | undefined
  >(undefined)
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>(
    undefined
  )
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>(undefined)
  const [filterKeyword, setFilterKeyword] = useState('')

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { session, supabase } = useSupabase()
  const { hasAccess, setToast } = useFilter()

  const apiUrl = process.env.NEXT_PUBLIC_AO_API_URL ?? ''

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchMedicineClients(
        {
          filterKeyword,
          filterPharmacy,
          filterDateRequested,
          filterDateFrom,
          filterDateTo,
        },
        perPageCount,
        0
      )

      // update the list in redux
      dispatch(updateList(result.data))

      setResultsCount(result.count ? result.count : 0)
      setShowingCount(result.data.length)
    } catch (error) {
      console.error('error', error)
    }

    setLoading(false)
  }

  const handleShowMore = async () => {
    setLoading(true)

    try {
      const result = await fetchMedicineClients(
        {
          filterKeyword,
          filterPharmacy,
          filterDateRequested,
          filterDateFrom,
          filterDateTo,
        },
        perPageCount,
        list.length
      )

      // update the list in redux
      const newList = [...list, ...result.data]
      dispatch(updateList(newList))

      setResultsCount(result.count ? result.count : 0)
      setShowingCount(newList.length)
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

  const handleDelete = (id: string) => {
    setSelectedId(id)
    setShowDeleteModal(true)
  }

  const generateGLNo = async (pcode: string) => {
    const { data, error } = await supabase
      .from('adm_medicine_clients')
      .select('gl_no')
      .eq('status', 'Approved')
      .eq('pharmacy_code', pcode)
      .not('gl_no', 'is', null)
      .order('gl_no', { ascending: false })
      .limit(1)

    if (!error) {
      if (data.length > 0) {
        const rn = !isNaN(data[0].gl_no) ? Number(data[0].gl_no) + 1 : 1
        return rn
      } else {
        return 1
      }
    } else {
      return 1
    }
  }

  const handleApprove = async (item: MedicalAssistanceTypes) => {
    const pharmacy = pharmacyList.find((p) => p.pharmacy === item.pharmacy)

    if (!pharmacy) {
      // pop up the error message
      setToast('error', 'Something went wrong, please contact Berl.')
      return
    }

    try {
      const g = await generateGLNo(pharmacy?.code)
      const newData = {
        status: 'Approved',
        gl_no: g,
        date_approved: format(new Date(), 'yyyy-MM-dd'),
      }

      const { error } = await supabase
        .from('adm_medicine_clients')
        .update(newData)
        .eq('id', item.id)

      if (error) throw new Error(error.message)

      // Append new data in redux
      const items = [...globallist]
      const updatedData = {
        ...newData,
        id: item.id,
      }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      // pop up the success message
      setToast('success', 'Successfully approved.')
    } catch (error) {
      console.error('error', error)
    }
  }

  // const handleDisapprove = async (id: string) => {
  //   try {
  //     const newData = {
  //       status: 'Disapproved',
  //       date_approved: format(new Date(), 'yyyy-MM-dd'),
  //     }

  //     const { error } = await supabase
  //       .from('adm_medicine_clients')
  //       .update(newData)
  //       .eq('id', id)

  //     if (error) throw new Error(error.message)

  //     // Append new data in redux
  //     const items = [...globallist]
  //     const updatedData = {
  //       ...newData,
  //       id,
  //     }
  //     const foundIndex = items.findIndex((x) => x.id === updatedData.id)
  //     items[foundIndex] = { ...items[foundIndex], ...updatedData }
  //     dispatch(updateList(items))

  //     // pop up the success message
  //     setToast('success', 'Successfully disapproved.')
  //   } catch (error) {
  //     console.error('error', error)
  //   }
  // }

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
    // filterBillType,
    filterPharmacy,
    filterDateRequested,
    filterDateFrom,
    filterDateTo,
  ])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (!hasAccess('medicine') && !superAdmins.includes(session.user.email))
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
            <Title title="AO Medication Assistance" />
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
              // setFilterBillType={setFilterBillType}
              setFilterPharmacy={setFilterPharmacy}
              setFilterDateRequested={setFilterDateRequested}
              setFilterDateFrom={setFilterDateFrom}
              setFilterDateTo={setFilterDateTo}
              setFilterKeyword={setFilterKeyword}
            />
          </div>

          {/* Export Button */}
          {!isDataEmpty && (
            <div className="mx-4 mb-4 flex justify-end space-x-2">
              <PrintSummaryButton selectedItems={list} />
            </div>
          )}

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
                  <th className="app__th pl-4"></th>
                  <th className="app__th">Patient</th>
                  <th className="app__th">Status</th>
                  <th className="app__th">Date Requested</th>
                  <th className="app__th">Date Approved</th>
                  <th className="app__th">Pharmacy</th>
                  <th className="app__th">Address</th>
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
                                {
                                  <Menu.Item>
                                    <div
                                      onClick={() => handleDelete(item.id)}
                                      className="app__dropdown_item">
                                      <TrashIcon className="w-4 h-4" />
                                      <span>Delete</span>
                                    </div>
                                  </Menu.Item>
                                }
                                {item.status === 'Approved' && (
                                  <Menu.Item>
                                    <div className="app__dropdown_item">
                                      <PrintGLButton selectedItem={item} />
                                    </div>
                                  </Menu.Item>
                                )}
                                <Menu.Item>
                                  <div className="app__dropdown_item2">
                                    {item.status === 'For Evaluation' && (
                                      <>
                                        <CustomButton
                                          containerStyles="app__btn_green_xs"
                                          title="Approve"
                                          btnType="button"
                                          handleClick={() =>
                                            handleApprove(item)
                                          }
                                        />
                                        {/* <CustomButton
                                          containerStyles="app__btn_red_xs"
                                          title="Disapprove"
                                          btnType="button"
                                          handleClick={() =>
                                            handleDisapprove(item.id)
                                          }
                                        /> */}
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
                      </th>
                      <td className="app__td">
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
                        </div>
                      </td>
                      <td className="app__td">
                        {item.date_requested && item.date_requested !== '' ? (
                          <span>
                            {format(
                              new Date(item.date_requested),
                              'MMM dd, yyyy'
                            )}
                          </span>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="app__td">
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
                      <td className="app__td">{item.pharmacy}</td>
                      <td className="app__td">
                        {item.barangay}, {item.address}
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
          {resultsCount > showingCount && !loading && (
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

      {/* Confirm Delete Modal */}
      {showDeleteModal && (
        <DeleteModal
          table="adm_medicine_clients"
          selectedId={selectedId}
          showingCount={showingCount}
          setShowingCount={setShowingCount}
          resultsCount={resultsCount}
          setResultsCount={setResultsCount}
          hideModal={() => setShowDeleteModal(false)}
        />
      )}
    </>
  )
}
export default Page
