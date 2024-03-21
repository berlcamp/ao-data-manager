'use client'

import { createContext, useContext, useState } from 'react'
import { createBrowserClient } from '../utils/supabase-browser'

const Context = createContext()

export default function SupabaseProvider ({ children, session, systemAccess, systemUsers, currentUser, ipLists }) {
  const [supabase] = useState(() => createBrowserClient())

  return (
    <Context.Provider value={{ supabase, session, systemAccess, systemUsers, currentUser, ipLists }}>
      <>{children}</>
    </Context.Provider>
  )
}

export const useSupabase = () => useContext(Context)
