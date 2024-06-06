'use client'

import {
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
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import uuid from 'react-uuid'
import Filters from './Filters'
// Types
import type { VoterBarangayTypes, VoterTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { useDispatch, useSelector } from 'react-redux'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<VoterTypes[]>([])
  const [list2, setList2] = useState([])
  const [list3, setList3] = useState([])
  const [barangays, setBarangays] = useState<VoterBarangayTypes[] | []>([])

  const { hasAccess } = useFilter()
  const { session } = useSupabase()

  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterAddress, setFilterAddress] = useState<string>('')
  const [perPageCount, setPerPageCount] = useState<number>(10)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    const params = {
      filterKeyword,
      filterAddress,
      take: perPageCount,
      skip: 0,
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_AO_API_URL ?? ''
      await axios.get(`${apiUrl}/aorv/search`, { params }).then((response) => {
        // update the list in redux
        dispatch(updateList(response.data.results2023))

        // Updating showing text in redux
        dispatch(
          updateResultCounter({
            showing: response.data.results2023.length,
            results: response.data.total_results,
          })
        )

        // results of 2022
        setList2(response.data.results2022)

        // results of 2022
        setList3(response.data.results2019)
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
      filterAddress,
      take: perPageCount,
      skip: resultsCounter.showing,
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_AO_API_URL ?? ''
      await axios.get(`${apiUrl}/aorv/search`, { params }).then((response) => {
        // update the list in redux
        const newList = [...list, ...response.data.results2023]
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

  // Update list whenever list in redux updates
  useEffect(() => {
    setList(globallist)
  }, [globallist])

  // Featch data
  useEffect(() => {
    setList([])
    void fetchData()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKeyword, filterAddress, perPageCount])

  // Featch data
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        console.log('refetching barangays')
        const apiUrl = process.env.NEXT_PUBLIC_AO_API_URL ?? ''
        const response = await axios.get(`${apiUrl}/aorv/barangays`)
        setBarangays(response.data)
      } catch (error) {
        console.error('An error occurred', error)
      }
    }
    void fetchBarangays()
  }, [])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (!hasAccess('voters') && !superAdmins.includes(session.user.email))
    return <Unauthorized />

  return (
    <>
      <Sidebar>
        <></>
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="Registered Voters" />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterKeyword={setFilterKeyword}
              setFilterAddress={setFilterAddress}
              barangays={barangays}
            />
          </div>

          {!isDataEmpty && (
            <div className="px-4 text-sm my-2 text-gray-700 font-semibold">
              Results from 2023 masterlist
            </div>
          )}

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
                  <th className="hidden md:table-cell app__th pl-4">ID</th>
                  <th className="hidden md:table-cell app__th">Fullname</th>
                  <th className="hidden md:table-cell app__th">Category</th>
                  <th className="hidden md:table-cell app__th">P.I.</th>
                  <th className="hidden md:table-cell app__th">
                    Category Prior BSK
                  </th>
                  <th className="hidden md:table-cell app__th">
                    Service Provider
                  </th>
                  <th className="hidden md:table-cell app__th">Address</th>
                </tr>
              </thead>
              <tbody>
                {!isDataEmpty &&
                  list.map((item: VoterTypes) => (
                    <tr
                      key={uuid()}
                      className="app__tr">
                      <th className="app__th_firstcol">
                        {item.id}
                        {/* Mobile View */}
                        <div>
                          <div className="md:hidden app__td_mobile">
                            <div>
                              <span className="font-normal">Fullname:</span>{' '}
                              {item.fullname}
                            </div>
                            <div>
                              <span className="font-normal">Precinct:</span>{' '}
                              {item.precinct}
                            </div>
                            <div>
                              <span className="font-normal">
                                Category Prior BSK:
                              </span>{' '}
                              {item.category_prior_bsk}
                            </div>
                            <div className="flex space-x-2">
                              <span>
                                <span className="font-normal">Category:</span>{' '}
                                {item.category}
                              </span>
                              <span>
                                {item.category_recommended.trim() !== '' &&
                                  item.category !== item.category_recommended &&
                                  `(RC - ${item.category_recommended})`}
                              </span>
                            </div>
                            <div>
                              <span className="font-normal">P.I.:</span>{' '}
                              {item.petition}
                            </div>
                            <div>
                              <span className="font-normal">Address:</span>{' '}
                              {item.address}
                            </div>
                            <div>
                              <span className="font-normal">
                                Service Provider:
                              </span>
                              : &nbsp;
                              {item.service_provider && (
                                <>
                                  {item.service_provider.new !== ''
                                    ? item.service_provider.new
                                    : item.service_provider.name}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* End - Mobile View */}
                      </th>
                      <td className="hidden md:table-cell app__td">
                        {item.fullname}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        <div className="flex space-x-2">
                          <span>{item.category}</span>
                          <span>
                            {item.category_recommended.trim() !== '' &&
                              item.category !== item.category_recommended &&
                              `(RC - ${item.category_recommended})`}
                          </span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.petition}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.category_prior_bsk}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.service_provider && (
                          <>
                            {item.service_provider.new !== ''
                              ? item.service_provider.new
                              : item.service_provider.name}
                          </>
                        )}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.address}
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
          {resultsCounter.results > resultsCounter.showing && !loading && (
            <ShowMore handleShowMore={handleShowMore} />
          )}

          {/* 2022 Result */}
          {!loading && list2.length > 0 && (
            <div>
              <div className="px-4 text-sm mt-8 mb-2 text-gray-700 font-semibold">
                Results from 2022 masterlist
              </div>
              <table className="app__table">
                <thead className="app__thead">
                  <tr>
                    <th className="hidden md:table-cell app__th pl-4">ID</th>
                    <th className="hidden md:table-cell app__th">Fullname</th>
                    <th className="hidden md:table-cell app__th">Category</th>
                    <th className="hidden md:table-cell app__th">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {list2.map((item: VoterTypes) => (
                    <tr
                      key={uuid()}
                      className="app__tr">
                      <th className="app__th_firstcol">
                        {item.id}
                        {/* Mobile View */}
                        <div>
                          <div className="md:hidden app__td_mobile">
                            <div>{item.fullname}</div>
                            <div>{item.category}</div>
                            <div>{item.address}</div>
                          </div>
                        </div>
                        {/* End - Mobile View */}
                      </th>
                      <td className="hidden md:table-cell app__td">
                        {item.fullname}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.category}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.address}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2019 Result */}
          {!loading && list2.length > 0 && (
            <div>
              <div className="px-4 text-sm mt-8 mb-2 text-gray-700 font-semibold">
                Results from 2019 masterlist
              </div>
              <table className="app__table">
                <thead className="app__thead">
                  <tr>
                    <th className="hidden md:table-cell app__th pl-4">ID</th>
                    <th className="hidden md:table-cell app__th">Fullname</th>
                    <th className="hidden md:table-cell app__th">Category</th>
                    <th className="hidden md:table-cell app__th">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {list3.map((item: VoterTypes) => (
                    <tr
                      key={uuid()}
                      className="app__tr">
                      <th className="app__th_firstcol">
                        {item.id}
                        {/* Mobile View */}
                        <div>
                          <div className="md:hidden app__td_mobile">
                            <div>{item.fullname}</div>
                            <div>{item.category}</div>
                            <div>{item.address}</div>
                          </div>
                        </div>
                        {/* End - Mobile View */}
                      </th>
                      <td className="hidden md:table-cell app__td">
                        {item.fullname}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.category}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.address}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
export default Page
