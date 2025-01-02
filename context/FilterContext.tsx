'use client'
import { LandingPage, OfflinePage } from '@/components/index'
import { useSupabase } from '@/context/SupabaseProvider'
import type { UserAccessTypes } from '@/types/index'
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const FilterContext = React.createContext<any | ''>('')

export function useFilter() {
  return useContext(FilterContext)
}

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const { systemAccess, session, ipLists } = useSupabase()
  const [isOnline, setIsOnline] = useState(true)
  const [isIpAccepted, setIsIpAccepted] = useState(true)
  const [filters, setFilters] = useState({})
  const [perPage, setPerPage] = useState(10)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [ipcrfTotalScore, setIpcrfTotalScore] = useState([])

  const setToast = (type: string, message: string) => {
    if (type === 'success') {
      toast.success(message)
    }
    if (type === 'error') {
      toast.error(message)
    }
  }

  const hasAccess = (type: string) => {
    const find = systemAccess.find((item: UserAccessTypes) => {
      return item.type === type && item.user_id.toString() === session.user.id
    })

    if (find) {
      return true
    } else {
      return false
    }
  }

  useEffect(() => {
    function handleOnlineStatus() {
      setIsOnline(true)
    }

    function handleOfflineStatus() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOfflineStatus)

    return () => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOfflineStatus)
    }
  }, [])

  useEffect(() => {
    // Fetch data from an API to get IP address
    ;(async () => {
      // Fetch data from an API to get IP address
      const res = await fetch('/api/ip')
      const ipData = await res.json()
      const ip = ipData.ip.toString()

      const find = ipLists.find((item: any) => {
        return item.ip === ip
      })

      if (find) {
        setIsIpAccepted(true)
      } else {
        setIsIpAccepted(false)
      }
    })()
  }, [])

  const value = {
    filters,
    setFilters,
    hasAccess,
    setToast,
    perPage,
    session,
    setPerPage,
    isDarkMode,
    setIsDarkMode,
    ipcrfTotalScore,
    setIpcrfTotalScore,
  }

  if (!isIpAccepted) {
    // return <NotWhitelisted /> //temporary, uncomment this
  }

  if (!session) {
    return <LandingPage />
  }

  return (
    <FilterContext.Provider value={value}>
      {!isOnline ? (
        <>
          <OfflinePage />
          <div className="pointer-events-none">{children}</div>
        </>
      ) : (
        children
      )}
    </FilterContext.Provider>
  )
}
