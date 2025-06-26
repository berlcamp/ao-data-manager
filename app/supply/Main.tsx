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
import type { SupplyTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import SupplySidebar from '@/components/Sidebars/SupplySidebar'
import { fetchSupplies } from '@/utils/fetchApi'
import { ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/20/solid'
import { format } from 'date-fns'
import { TrashIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import AddEditModal from './AddEditModal'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)

  // List
  const [list, setList] = useState<SupplyTypes[]>([])
  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [showingCount, setShowingCount] = useState<number>(0)
  const [resultsCount, setResultsCount] = useState<number>(0)

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editData, setEditData] = useState<SupplyTypes | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Filters
  const [filterType, setFilterType] = useState('All')
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
      const result = await fetchSupplies(
        {
          filterKeyword,
          filterType,
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
      const result = await fetchSupplies(
        {
          filterKeyword,
          filterType,
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

  const handleEdit = (item: SupplyTypes) => {
    setShowAddModal(true)
    setEditData(item)
  }

  const handleDelete = (id: number) => {
    setSelectedId(id)
    setShowDeleteModal(true)
  }

  // Cancel confirmation
  const cancel = (id: number) => {
    setShowConfirmation(true)
    setSelectedId(id)
  }
  const handleCancel = () => {
    setShowConfirmation(false)
    setSelectedId(null)
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
  }, [filterKeyword, perPageCount, filterType])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (!hasAccess('supply') && !superAdmins.includes(session.user.email))
    return <Unauthorized />

  return (
    <>
      <Sidebar>
        <SupplySidebar />
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="Supplies" />
            <CustomButton
              containerStyles="app__btn_green"
              title="Add New Supply"
              btnType="button"
              handleClick={handleAdd}
            />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterType={setFilterType}
              setFilterKeyword={setFilterKeyword}
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
                  <th className="app__th pl-4"></th>
                  <th className="app__th">Supply</th>
                  <th className="app__th">Category</th>
                  <th className="app__th">SRP</th>
                  <th className="app__th">Government Price</th>
                  <th className="app__th">Price as Of</th>
                </tr>
              </thead>
              <tbody>
                {!isDataEmpty &&
                  list.map((item: SupplyTypes) => (
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
                                    {item.status !== 'Archived' && (
                                      <Menu.Item>
                                        <div
                                          onClick={() => cancel(item.id)}
                                          className="app__dropdown_item">
                                          <TrashIcon className="w-4 h-4" />
                                          <span>Move to archived</span>
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
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <th className="app__th_firstcol">
                        <div>{item.name}</div>
                      </th>
                      <th className="app__th_firstcol">
                        <div>{item.category}</div>
                      </th>
                      <th className="app__th_firstcol">
                        <div>
                          {item.srp ? Number(item.srp).toLocaleString() : ''}
                        </div>
                      </th>
                      <th className="app__th_firstcol">
                        <div>
                          {item.government_price
                            ? Number(item.government_price).toLocaleString()
                            : ''}
                        </div>
                      </th>
                      <td className="app__td">
                        <div>
                          {format(
                            new Date(item.current_price_as_of),
                            'MMMM dd, yyyy'
                          )}
                        </div>
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
      {showDeleteModal && selectedId && (
        <DeleteModal
          table="adm_dswd_endorsements"
          selectedId={selectedId.toString()}
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
