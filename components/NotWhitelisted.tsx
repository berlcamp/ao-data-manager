'use client'
import { TopBarDark } from '@/components/index'

export default function NotWhitelisted() {
  return (
    <>
      <div className="app__landingpage">
        <TopBarDark isGuest={true} />
        <div className="mt-20 flex flex-col space-y-2 items-center justify-center">
          <div>You are not authorized to access this page.</div>
        </div>
        <div className="mt-auto bg-gray-800 p-4 text-white fixed bottom-0 w-full">
          <div className="text-white text-center text-xs">&copy; DDM v1.0</div>
        </div>
      </div>
    </>
  )
}
