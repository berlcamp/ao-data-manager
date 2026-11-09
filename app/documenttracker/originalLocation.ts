import type { SupabaseClient } from '@supabase/supabase-js'

const PAGE_SIZE = 1000
const CHUNK_SIZE = 200

// A document's original location is the title of its first route log (the
// one created together with the document). Returns trackerId -> first route.
export const fetchFirstRoutes = async (
  supabase: SupabaseClient,
  trackerIds: (string | number)[],
) => {
  const first = new Map<string, { id: number; title: string }>()
  const ids = Array.from(new Set(trackerIds.map(String)))

  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE)
    // PostgREST caps each response, so page through until a short page
    for (let start = 0; ; start += PAGE_SIZE) {
      const { data, error } = await supabase
        .from('adm_tracker_routes')
        .select('id, tracker_id, title')
        .in('tracker_id', chunk)
        .order('id', { ascending: true })
        .range(start, start + PAGE_SIZE - 1)

      if (error) throw new Error(error.message)

      data?.forEach((r) => {
        const key = String(r.tracker_id)
        if (!first.has(key)) first.set(key, { id: r.id, title: r.title })
      })
      if (!data || data.length < PAGE_SIZE) break
    }
  }

  return first
}

// Adds `original_location` to each tracker in the list
export const withOriginalLocations = async <T extends { id: string | number }>(
  supabase: SupabaseClient,
  items: T[],
): Promise<(T & { original_location: string | null })[]> => {
  if (items.length === 0) return []
  const first = await fetchFirstRoutes(
    supabase,
    items.map((i) => i.id),
  )
  return items.map((i) => ({
    ...i,
    original_location: first.get(String(i.id))?.title ?? null,
  }))
}
