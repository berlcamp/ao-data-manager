'use client'

import {
  ConfirmModal,
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
import { superAdmins } from '@/constants/TrackerConstants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { Menu, Transition } from '@headlessui/react'
import React, { Fragment, useEffect, useState } from 'react'
import uuid from 'react-uuid'
import Filters from './Filters'
// Types
import type { DswdEndorsementTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import AssistanceSidebar from '@/components/Sidebars/AssistanceSidebar'
import { fetchDswdEndorsements } from '@/utils/fetchApi'
import { ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/20/solid'
import { format } from 'date-fns'
import { TrashIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import AddEditModal from './AddEditModal'
import PrintEndorsementButton from './PrintEndorsementButton'
import PrintSummaryButton from './PrintSummaryButton'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)

  // List
  const [list, setList] = useState<DswdEndorsementTypes[]>([])
  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [showingCount, setShowingCount] = useState<number>(0)
  const [resultsCount, setResultsCount] = useState<number>(0)

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editData, setEditData] = useState<DswdEndorsementTypes | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')

  // Filters
  const [filterType, setFilterType] = useState('All')
  const [filterRequest, setFilterRequest] = useState('All')
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
      const result = await fetchDswdEndorsements(
        {
          filterKeyword,
          filterType,
          filterRequest,
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
      const result = await fetchDswdEndorsements(
        {
          filterKeyword,
          filterType,
          filterRequest,
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

  const handleEdit = (item: DswdEndorsementTypes) => {
    setShowAddModal(true)
    setEditData(item)
  }

  const handleDelete = (id: string) => {
    setSelectedId(id)
    setShowDeleteModal(true)
  }

  // Cancel confirmation
  const cancel = (id: string) => {
    setShowConfirmation(true)
    setSelectedId(id)
  }
  const handleCancel = () => {
    setShowConfirmation(false)
    setSelectedId('')
  }
  const handleConfirm = async () => {
    await handleCancelGL()
    setShowConfirmation(false)
  }
  const handleCancelGL = async () => {
    try {
      const newData = {
        status: 'Cancelled',
      }

      const { error } = await supabase
        .from('adm_dswd_endorsements')
        .update(newData)
        .eq('id', selectedId)

      if (error) throw new Error(error.message)

      // Append new data in redux
      const items = [...globallist]
      const updatedData = {
        ...newData,
        id: selectedId,
      }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      // pop up the success message
      setToast('success', 'Successfully cancelled.')
    } catch (error) {
      console.error('error', error)
    }
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
    filterRequest,
    filterKeyword,
    perPageCount,
    filterType,
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
            <Title title="DSWD/PCSO Endorsements" />
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
              setFilterType={setFilterType}
              setFilterRequest={setFilterRequest}
              setFilterDateFrom={setFilterDateFrom}
              setFilterDateTo={setFilterDateTo}
              setFilterKeyword={setFilterKeyword}
            />
          </div>

          {/* Export Button */}
          {!isDataEmpty && (
            <div className="mx-4 mb-4 flex justify-end space-x-2">
              <PrintSummaryButton
                filterDateFrom={filterDateFrom}
                filterDateTo={filterDateTo}
                filterType={filterType}
              />
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
                  <th className="app__th">Type</th>
                  <th className="app__th">Patient</th>
                  <th className="app__th">Requester</th>
                  <th className="app__th">Date Requested</th>
                  <th className="app__th">Request</th>
                  <th className="app__th">Address</th>
                </tr>
              </thead>
              <tbody>
                {!isDataEmpty &&
                  list.map((item: DswdEndorsementTypes) => (
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
                                {hasAccess('medicine_admin') && (
                                  <>
                                    <Menu.Item>
                                      <div
                                        onClick={() => handleEdit(item)}
                                        className="app__dropdown_item">
                                        <PencilSquareIcon className="w-4 h-4" />
                                        <span>Edit</span>
                                      </div>
                                    </Menu.Item>
                                    {item.status !== 'Cancelled' && (
                                      <Menu.Item>
                                        <div
                                          onClick={() => cancel(item.id)}
                                          className="app__dropdown_item">
                                          <TrashIcon className="w-4 h-4" />
                                          <span>Mark as Cancelled</span>
                                        </div>
                                      </Menu.Item>
                                    )}
                                    <Menu.Item>
                                      <div
                                        onClick={() => handleDelete(item.id)}
                                        className="app__dropdown_item">
                                        <TrashIcon className="w-4 h-4" />
                                        <span>Delete</span>
                                      </div>
                                    </Menu.Item>
                                  </>
                                )}
                                <Menu.Item>
                                  <div className="app__dropdown_item">
                                    <PrintEndorsementButton
                                      selectedItem={item}
                                    />
                                  </div>
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <th className="app__th_firstcol">
                        <div>{item.endorsement_type}</div>
                      </th>
                      <th className="app__th_firstcol">
                        <div>
                          {item.patient_fullname}
                          {item.status === 'Cancelled' && (
                            <span className="ml-1 rounded-sm p-px bg-red-500 text-white">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="app__th_firstcol">
                        <div>{item.requester_fullname}</div>
                      </th>
                      <td className="app__td">
                        {item.date && item.date !== '' ? (
                          <span>
                            {format(new Date(item.date), 'MMM dd, yyyy')}
                          </span>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="app__td">
                        {item.type !== 'Other' ? item.type : item.other}
                      </td>
                      <td className="app__td">{item.patient_address}</td>
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

      {/* Confirm Cancel Modal */}
      {showConfirmation && (
        <ConfirmModal
          message="Are you sure you want to cancel this Endorsement?"
          header="Confirm cancel"
          btnText="Confirm"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* Confirm Delete Modal */}
      {showDeleteModal && (
        <DeleteModal
          table="adm_dswd_endorsements"
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
