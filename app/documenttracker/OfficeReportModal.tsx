'use client'
import TwoColTableLoading from '@/components/Loading/TwoColTableLoading'
import { CustomButton } from '@/components/index'
import { docRouting, documentTypes } from '@/constants/TrackerConstants'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { formatAmountWithCommas } from '@/utils/text-helper'
import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns'
import { FileSpreadsheet, FileText, PrinterIcon } from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { fetchFirstRoutes } from './originalLocation'
import {
  formatReportPeriod,
  sortAndDedupeRows,
  type OfficeReportMeta,
  type OfficeReportRow,
} from './officeReportShared'

interface ModalProps {
  hideModal: () => void
  preparedBy: string
}

const PAGE_SIZE = 1000
const MAX_RANGE_DAYS = 366
const STORAGE_KEY = 'tracker_office_report_location'
const ALL_LOCATIONS = '__all_locations__'

const locations = Array.from(new Set(docRouting)).sort((a, b) =>
  a.localeCompare(b),
)

const allTypes = documentTypes.map((d) => d.type)

const ymd = (date: Date) => format(date, 'yyyy-MM-dd')

const readSavedLocation = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === ALL_LOCATIONS || locations.includes(saved ?? '')
      ? (saved ?? '')
      : ''
  } catch {
    return ''
  }
}

export default function OfficeReportModal({
  hideModal,
  preparedBy,
}: ModalProps) {
  const today = ymd(new Date())

  const [location, setLocation] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(allTypes)
  const [isRange, setIsRange] = useState(false)
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [loggedByMe, setLoggedByMe] = useState(false)

  const [rows, setRows] = useState<OfficeReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [loadError, setLoadError] = useState('')

  // Ignore responses from requests that have been superseded
  const requestIdRef = useRef(0)

  const { supabase, session } = useSupabase()
  const { setToast } = useFilter()

  const isAllLocations = location === ALL_LOCATIONS
  const locationLabel = isAllLocations ? 'All Locations' : location
  const effectiveTo = isRange ? toDate : fromDate
  const isAllTypes = selectedTypes.length === allTypes.length
  const typesLabel = isAllTypes
    ? 'All Types'
    : selectedTypes.length <= 2
      ? selectedTypes.join(', ')
      : `${selectedTypes.length} types selected`

  const validationError = useMemo(() => {
    if (!location) return 'Select an original location to generate the report.'
    if (selectedTypes.length === 0) return 'Select at least one document type.'
    if (!fromDate || !effectiveTo) return 'Select a date.'
    if (fromDate > effectiveTo)
      return '"From" date must be on or before "To" date.'
    if (
      differenceInCalendarDays(parseISO(effectiveTo), parseISO(fromDate)) >=
      MAX_RANGE_DAYS
    )
      return `Date range cannot exceed ${MAX_RANGE_DAYS} days.`
    return ''
  }, [location, selectedTypes, fromDate, effectiveTo])

  const meta: OfficeReportMeta = {
    location: locationLabel,
    loggedBy: loggedByMe ? preparedBy : '',
    fromDate,
    toDate: effectiveTo,
    types: isAllTypes ? 'All' : selectedTypes.join(', '),
    preparedBy,
  }

  const summary = useMemo(() => {
    const counts = new Map<string, number>()
    rows.forEach((r) => counts.set(r.title, (counts.get(r.title) ?? 0) + 1))
    return Array.from(counts.entries())
  }, [rows])

  const fetchRows = async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setLoadError('')

    try {
      const candidates: OfficeReportRow[] = []
      // PostgREST caps each response, so page through until a short page
      for (let start = 0; ; start += PAGE_SIZE) {
        let query = supabase
          .from('adm_tracker_routes')
          .select(
            'id, title, date, time, user, adm_trackers!inner(id, routing_slip_no, type, requester, agency, amount, particulars, location, status)',
          )
          .gte('date', fromDate)
          .lte('date', effectiveTo)
          .eq('adm_trackers.archived', false)

        if (!isAllLocations) query = query.eq('title', location)
        // Only filter when some types are unchecked, so documents whose
        // type isn't in the list still show under "All Types"
        if (!isAllTypes) query = query.in('adm_trackers.type', selectedTypes)
        if (loggedByMe) query = query.eq('user_id', session.user.id)

        const { data, error } = await query
          .order('date', { ascending: true })
          .order('id', { ascending: true })
          .range(start, start + PAGE_SIZE - 1)

        if (error) throw new Error(error.message)
        if (requestId !== requestIdRef.current) return

        candidates.push(...(data as OfficeReportRow[]))
        if (!data || data.length < PAGE_SIZE) break
      }

      // Keep only routes that are the document's first route (its original
      // location), so later moves don't add the same document again
      const firstRoutes = await fetchFirstRoutes(
        supabase,
        candidates.map((r) => r.adm_trackers.id),
      )
      if (requestId !== requestIdRef.current) return

      const all = sortAndDedupeRows(
        candidates.filter(
          (r) => firstRoutes.get(String(r.adm_trackers.id))?.id === r.id,
        ),
      )

      setRows(all)
    } catch (e) {
      console.error('office report error', e)
      if (requestId === requestIdRef.current) {
        setRows([])
        setLoadError('Unable to load the report. Please try again.')
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }

  const handleExport = async (kind: 'print' | 'pdf' | 'excel') => {
    if (rows.length === 0) return
    setExporting(true)
    try {
      const exporter = await import('./officeReportExport')
      if (kind === 'print') exporter.printOfficeReportPdf(rows, meta)
      if (kind === 'pdf') exporter.downloadOfficeReportPdf(rows, meta)
      if (kind === 'excel') await exporter.downloadOfficeReportExcel(rows, meta)
    } catch (e) {
      console.error('office report export error', e)
      setToast('error', 'Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleLocationChange = (value: string) => {
    setLocation(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {}
  }

  const setQuickDate = (date: string) => {
    setIsRange(false)
    setFromDate(date)
    setToDate(date)
  }

  // Restore the last location used on this browser
  useEffect(() => {
    setLocation(readSavedLocation())
  }, [])

  // Reload whenever the criteria change and are valid
  useEffect(() => {
    if (validationError) {
      requestIdRef.current++
      setRows([])
      setLoading(false)
      return
    }
    void fetchRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    location,
    selectedTypes,
    fromDate,
    effectiveTo,
    loggedByMe,
    validationError,
  ])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hideModal()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hideModal])

  const isSingleDay = fromDate === effectiveTo
  const canExport =
    !loading && !exporting && !validationError && rows.length > 0

  return (
    <div className="app__modal_wrapper">
      <div className="app__modal_wrapper2_large">
        <div className="app__modal_wrapper3">
          <div className="app__modal_header">
            <h5 className="text-md font-bold leading-normal text-gray-800 dark:text-gray-300">
              Office Report: Documents by Original Location
            </h5>
            <CustomButton
              containerStyles="app__btn_gray"
              title="Close"
              btnType="button"
              handleClick={hideModal}
            />
          </div>

          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Criteria */}
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col w-60">
                <label
                  htmlFor="report-location"
                  className="app__form_label">
                  Original Location
                </label>
                <select
                  id="report-location"
                  className="app__select_standard bg-white"
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}>
                  <option value="">Choose location</option>
                  <option value={ALL_LOCATIONS}>All Locations</option>
                  {locations.map((l) => (
                    <option
                      key={l}
                      value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col w-60">
                <div className="flex items-center justify-between">
                  <span className="app__form_label">Document Type</span>
                  <span className="text-xs space-x-2">
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => setSelectedTypes(allTypes)}>
                      All
                    </button>
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => setSelectedTypes([])}>
                      None
                    </button>
                  </span>
                </div>
                <Listbox
                  value={selectedTypes}
                  onChange={setSelectedTypes}
                  multiple>
                  <div className="relative">
                    <Listbox.Button className="relative w-full text-left text-sm py-1 pl-2 pr-8 text-gray-600 bg-white border border-gray-300 rounded-sm focus:outline-none">
                      <span className="block truncate">
                        {selectedTypes.length === 0
                          ? 'None selected'
                          : typesLabel}
                      </span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDownIcon
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0">
                      <Listbox.Options className="absolute z-40 mt-1 max-h-72 w-72 overflow-auto rounded-sm bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {allTypes.map((type) => (
                          <Listbox.Option
                            key={type}
                            value={type}
                            className={({ active }) =>
                              `relative cursor-default select-none py-1 pl-9 pr-4 text-sm ${
                                active
                                  ? 'bg-amber-50 text-amber-900'
                                  : 'text-gray-900'
                              }`
                            }>
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? 'font-medium' : 'font-normal'
                                  }`}>
                                  {type}
                                </span>
                                {selected && (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-amber-600">
                                    <CheckIcon
                                      className="h-4 w-4"
                                      aria-hidden="true"
                                    />
                                  </span>
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="report-from"
                  className="app__form_label">
                  {isRange ? 'From' : 'Date'}
                </label>
                <input
                  id="report-from"
                  type="date"
                  className="app__input_standard bg-white"
                  value={fromDate}
                  max={today}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              {isRange && (
                <div className="flex flex-col">
                  <label
                    htmlFor="report-to"
                    className="app__form_label">
                    To
                  </label>
                  <input
                    id="report-to"
                    type="date"
                    className="app__input_standard bg-white"
                    value={toDate}
                    min={fromDate}
                    max={today}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pb-1 text-xs">
                <button
                  type="button"
                  className={`px-2 py-1 border rounded-sm ${
                    !isRange && fromDate === today
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  onClick={() => setQuickDate(today)}>
                  Today
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 border rounded-sm ${
                    !isRange && fromDate === ymd(subDays(new Date(), 1))
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  onClick={() => setQuickDate(ymd(subDays(new Date(), 1)))}>
                  Yesterday
                </button>
                <label className="flex items-center gap-1 text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRange}
                    onChange={(e) => {
                      setIsRange(e.target.checked)
                      setToDate(fromDate)
                    }}
                  />
                  Date range
                </label>
                <label className="flex items-center gap-1 text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loggedByMe}
                    onChange={(e) => setLoggedByMe(e.target.checked)}
                  />
                  Logged by Me
                </label>
              </div>
            </div>

            {/* Status + Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-b border-gray-200 py-2">
              <div className="text-sm text-gray-700">
                {validationError ? (
                  <span className="text-gray-500">{validationError}</span>
                ) : loading ? (
                  <span>Loading...</span>
                ) : loadError ? (
                  <span className="text-red-600 font-medium">{loadError}</span>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span>
                      <span className="font-bold">{rows.length}</span> document
                      {rows.length === 1 ? '' : 's'} for{' '}
                      <span className="font-bold">{locationLabel}</span> on{' '}
                      <span className="font-bold">
                        {formatReportPeriod(meta)}
                      </span>
                    </span>
                    {summary.length > 1 &&
                      summary.map(([title, count]) => (
                        <span
                          key={title}
                          className="text-xs bg-gray-200 rounded-sm px-2 py-px">
                          {title}: {count}
                        </span>
                      ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <CustomButton
                  containerStyles="app__btn_blue"
                  title="Print"
                  btnType="button"
                  isDisabled={!canExport}
                  leftIcon={<PrinterIcon className="w-4 h-4" />}
                  handleClick={() => handleExport('print')}
                />
                <CustomButton
                  containerStyles="app__btn_orange"
                  title="Save PDF"
                  btnType="button"
                  isDisabled={!canExport}
                  leftIcon={<FileText className="w-4 h-4" />}
                  handleClick={() => handleExport('pdf')}
                />
                <CustomButton
                  containerStyles="app__btn_green"
                  title="Download Excel"
                  btnType="button"
                  isDisabled={!canExport}
                  leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                  handleClick={() => handleExport('excel')}
                />
              </div>
            </div>

            {/* Preview */}
            {loading && <TwoColTableLoading />}
            {!loading &&
              !validationError &&
              !loadError &&
              rows.length === 0 && (
                <div className="app__norecordsfound">
                  No documents
                  {isAllLocations ? '' : ' originally logged at this location'}
                  {loggedByMe ? ' by you' : ''} on the selected date.
                </div>
              )}
            {!loading && rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="app__table">
                  <thead className="app__thead">
                    <tr>
                      <th className="app__th">#</th>
                      <th className="app__th">
                        {isSingleDay ? 'Time' : 'Date/Time'}
                      </th>
                      <th className="app__th">Routing No</th>
                      <th className="app__th">Requester / Agency</th>
                      <th className="app__th">Amount</th>
                      <th className="app__th">Particulars</th>
                      <th className="app__th">Original Location</th>
                      <th className="app__th">Logged By</th>
                      <th className="app__th">Current Location / Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={row.id}
                        className="app__tr">
                        <td className="app__td">{index + 1}</td>
                        <td className="app__td whitespace-nowrap">
                          {!isSingleDay && (
                            <div>
                              {format(parseISO(row.date), 'MMM d, yyyy')}
                            </div>
                          )}
                          <div>{row.time}</div>
                        </td>
                        <td className="app__td">
                          <div className="font-bold">
                            {row.adm_trackers.routing_slip_no}
                          </div>
                          <div className="text-gray-500">
                            {row.adm_trackers.type}
                          </div>
                        </td>
                        <td className="app__td max-w-[180px]">
                          <div>{row.adm_trackers.requester}</div>
                          <div className="text-gray-500">
                            {row.adm_trackers.agency}
                          </div>
                        </td>
                        <td className="app__td whitespace-nowrap">
                          {formatAmountWithCommas(row.adm_trackers.amount)}
                        </td>
                        <td className="app__td max-w-[300px]">
                          {row.adm_trackers.particulars}
                        </td>
                        <td className="app__td">{row.title}</td>
                        <td className="app__td">{row.user}</td>
                        <td className="app__td">
                          <div>{row.adm_trackers.location}</div>
                          <div className="text-gray-500">
                            {row.adm_trackers.status}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
