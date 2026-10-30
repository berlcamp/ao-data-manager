import type { AccountTypes } from '@/types'
import { createBrowserClient } from '@supabase/ssr'
import { format } from 'date-fns'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function fetchPurchaseOrders(
  filters: {
    filterType?: string
    filterKeyword?: string
  },
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('adm_ris_purchase_orders')
      .select('*, asenso_user:created_by(*), adm_ris(quantity)', {
        count: 'exact',
      })

    // Full text search
    if (
      typeof filters.filterKeyword !== 'undefined' &&
      filters.filterKeyword.trim() !== ''
    ) {
      query = query.eq('po_number', filters.filterKeyword)
    }

    // Filter type
    if (
      typeof filters.filterType !== 'undefined' &&
      filters.filterType.trim() !== 'All'
    ) {
      query = query.eq('type', filters.filterType)
    }

    // Perform count before paginations
    // const { count } = await query

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)
    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error xx', error)
    return { data: [], count: 0 }
  }
}

export async function fetchRis(
  filters: {
    filterKeyword?: string
  },
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('adm_ris')
      .select(
        '*, asenso_user:created_by(*), vehicle:vehicle_id(*), purchase_order:po_id(*), department:department_id(*)',
        { count: 'exact' }
      )

    // Full text search
    if (
      typeof filters.filterKeyword !== 'undefined' &&
      filters.filterKeyword.trim() !== ''
    ) {
      query = query.or(
        `id.eq.${Number(filters.filterKeyword) || 0},requester.ilike.%${
          filters.filterKeyword
        }%`
      )
    }

    // Perform count before paginations
    // const { count } = await query

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)
    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error xx', error)
    return { data: [], count: 0 }
  }
}

export async function fetchRisVehicles(
  filters: {
    filterKeyword?: string
  },
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('adm_ris_vehicles')
      .select('*', { count: 'exact' })

    // Full text search
    if (
      typeof filters.filterKeyword !== 'undefined' &&
      filters.filterKeyword.trim() !== ''
    ) {
      query = query.or(
        `name.ilike.%${filters.filterKeyword}%,plate_number.ilike.%${filters.filterKeyword}%`
      )
    }

    // Perform count before paginations
    // const { count } = await query

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)
    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error xx', error)
    return { data: [], count: 0 }
  }
}

export async function fetchRisDepartments(
  filters: {
    filterKeyword?: string
  },
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('adm_ris_departments')
      .select('*', { count: 'exact' })

    // Full text search
    if (
      typeof filters.filterKeyword !== 'undefined' &&
      filters.filterKeyword.trim() !== ''
    ) {
      query = query.or(`name.ilike.%${filters.filterKeyword}%`)
    }

    // Perform count before paginations
    // const { count } = await query

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)
    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error xx', error)
    return { data: [], count: 0 }
  }
}

export async function fetchActivities(today: Date, endDate: Date) {
  try {
    const { data, count, error } = await supabase
      .from('adm_trackers')
      .select('*', { count: 'exact' })
      .gte('activity_date', today.toISOString())
      .lt('activity_date', endDate.toISOString())
      .order('activity_date', { ascending: true })
      .limit(100)

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchMedicineClients(
  filters: {
    filterKeyword?: string
    filterPharmacy?: string
    filterDateRequested?: Date | undefined
    filterDateFrom?: Date | undefined
    filterDateTo?: Date | undefined
  },
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('adm_medicine_clients')
      .select('*', { count: 'exact' })

    // Full text search
    if (filters.filterKeyword && filters.filterKeyword.trim() !== '') {
      query = query.or(
        `fullname.ilike.%${filters.filterKeyword}%, requester.ilike.%${filters.filterKeyword}%`
      )
    }

    // Filter pharmacy
    if (filters.filterPharmacy && filters.filterPharmacy !== 'All') {
      query = query.eq('pharmacy', filters.filterPharmacy)
    }

    // Filter date requester
    if (filters.filterDateRequested) {
      query = query.eq(
        'date_requested',
        format(new Date(filters.filterDateRequested), 'yyyy-MM-dd')
      )
    }
    // Filter date from
    if (filters.filterDateFrom) {
      query = query.gte(
        'date_approved',
        format(new Date(filters.filterDateFrom), 'yyyy-MM-dd')
      )
    }

    // Filter date to
    if (filters.filterDateTo) {
      query = query.lte(
        'date_approved',
        format(new Date(filters.filterDateTo), 'yyyy-MM-dd')
      )
    }

    // Perform count before paginations
    // const { count } = await query

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)
    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error xx', error)
    return { data: [], count: 0 }
  }
}

export async function fetchDswdEndorsements(
  filters: {
    filterKeyword?: string
    filterType?: string
    filterRequest?: string
    filterDateFrom?: Date | undefined
    filterDateTo?: Date | undefined
  },
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('adm_dswd_endorsements')
      .select('*', { count: 'exact' })

    // Full text search
    if (filters.filterKeyword && filters.filterKeyword.trim() !== '') {
      query = query.or(
        `patient_fullname.ilike.%${filters.filterKeyword}%, requester_fullname.ilike.%${filters.filterKeyword}%`
      )
    }

    // Filter type
    if (filters.filterType && filters.filterType !== 'All') {
      query = query.eq('endorsement_type', filters.filterType)
    }

    // Filter Request
    if (filters.filterRequest && filters.filterRequest !== 'All') {
      query = query.eq('type', filters.filterRequest)
    }

    // Filter date from
    if (filters.filterDateFrom) {
      query = query.gte(
        'date',
        format(new Date(filters.filterDateFrom), 'yyyy-MM-dd')
      )
    }

    // Filter date to
    if (filters.filterDateTo) {
      query = query.lte(
        'date',
        format(new Date(filters.filterDateTo), 'yyyy-MM-dd')
      )
    }

    // Perform count before paginations
    // const { count } = await query

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)
    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error xx', error)
    return { data: [], count: 0 }
  }
}

export async function fetchSupplies(
  filters: {
    filterKeyword?: string
    filterType?: string
    filterRequest?: string
    filterDateFrom?: Date | undefined
    filterDateTo?: Date | undefined
  },
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase.from('adm_supply').select('*', { count: 'exact' })

    // Full text search
    if (filters.filterKeyword && filters.filterKeyword.trim() !== '') {
      query = query.or(`name.ilike.%${filters.filterKeyword}%`)
    }

    // Filter type
    if (filters.filterType && filters.filterType !== 'All') {
      query = query.eq('category', filters.filterType)
    }

    // Perform count before paginations
    // const { count } = await query

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)
    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error xx', error)
    return { data: [], count: 0 }
  }
}

export async function fetchAccounts(
  filters: { filterStatus?: string },
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('asenso_users')
      .select('*', { count: 'exact' })
      .neq('email', 'berlcamp@gmail.com')

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data: userData, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    const data: AccountTypes[] = userData

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function logError(
  transaction: string,
  table: string,
  data: string,
  error: string
) {
  await supabase.from('error_logs').insert({
    system: 'adm',
    transaction,
    table,
    data,
    error,
  })
}

export async function fetchErrorLogs(perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase.from('error_logs').select('*', { count: 'exact' })

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error logs error', error)
    return { data: [], count: 0 }
  }
}
