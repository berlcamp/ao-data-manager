'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { docRouting } from '@/constants/TrackerConstants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { useEffect, useState } from 'react'

export const DEFAULT_NEW_DOC_LOCATION = 'Received at OCM'

interface ModalProps {
  hideModal: () => void
  defaultLocation: string
  onSaved: (defaultLocation: string) => void
}

export default function SettingsModal({
  hideModal,
  defaultLocation,
  onSaved,
}: ModalProps) {
  const { setToast } = useFilter()
  const { supabase, session } = useSupabase()

  const [location, setLocation] = useState(defaultLocation)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('adm_tracker_user_settings').upsert({
      user_id: session.user.id,
      default_location: location,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)

    if (error) {
      console.error(error)
      setToast('error', 'Failed to save settings')
      return
    }
    onSaved(location)
    setToast('success', 'Settings saved')
    hideModal()
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hideModal()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hideModal])

  return (
    <div className="z-40 fixed top-0 left-0 w-full h-full outline-none overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50">
      <div className="sm:h-[calc(100%-3rem)] max-w-lg my-6 mx-auto relative w-auto pointer-events-none">
        <div className="max-h-full overflow-hidden border-none shadow-lg relative flex flex-col w-full pointer-events-auto bg-gray-50 bg-clip-padding rounded-sm outline-none text-current">
          <div className="flex flex-shrink-0 items-center justify-between p-4 border-b border-gray-200 rounded-t-md">
            <h5 className="text-md font-bold leading-normal text-gray-800">
              Settings
            </h5>
            <button
              onClick={hideModal}
              type="button"
              className="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline">
              &times;
            </button>
          </div>
          <div className="modal-body relative p-4">
            <div className="mb-4 space-y-2">
              <label className="app__form_label">
                Default location when creating a new document
              </label>
              <Select
                value={location}
                onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Location" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(docRouting)).map((route) => (
                    <SelectItem
                      key={route}
                      value={route}>
                      {route}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2 flex-shrink-0 flex-wrap items-center justify-end pt-4 border-t border-gray-200 rounded-b-md">
              <button
                onClick={handleSave}
                disabled={saving}
                type="button"
                className="flex items-center bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 font-medium px-2 py-1 text-sm text-white rounded-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={hideModal}
                type="button"
                className="flex items-center bg-gray-500 hover:bg-gray-600 border border-gray-600 font-medium px-2 py-1 text-sm text-white rounded-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
