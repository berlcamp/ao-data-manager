'use client'
import { TopBarDark } from '@/components/index'
import { useSupabase } from '@/context/SupabaseProvider'
import { useRouter } from 'next/navigation'

export default function NotWhitelisted({ ip }: { ip?: string }) {
  const { supabase } = useSupabase()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <>
      <div className="app__landingpage">
        <TopBarDark isGuest={true} />
        <div className="mt-20 flex flex-col space-y-2 items-center justify-center text-center px-4">
          <div>Access to the system is restricted to whitelisted networks.</div>
          {ip && (
            <div className="text-sm text-gray-500">
              Your IP address: <span className="font-mono">{ip}</span>
            </div>
          )}
          <div className="text-sm text-gray-500">
            Please contact the administrator if you need access from this
            location.
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="app__btn_red mt-4">
            Sign out
          </button>
        </div>
        <div className="mt-auto bg-gray-800 p-4 text-white fixed bottom-0 w-full">
          <div className="text-white text-center text-xs">&copy; DDM v1.0</div>
        </div>
      </div>
    </>
  )
}
