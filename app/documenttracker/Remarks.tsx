import { updateList } from '@/GlobalRedux/Features/listSlice'
import { CustomButton, TwoColTableLoading } from '@/components/index'
import { useSupabase } from '@/context/SupabaseProvider'
import { AccountTypes, DocumentRemarksTypes, DocumentTypes } from '@/types'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import Avatar from 'react-avatar'
import { useDispatch, useSelector } from 'react-redux'

const RemarksList = ({ remarks }: { remarks: DocumentRemarksTypes }) => {
  const { supabase, session } = useSupabase()

  return (
    <div className="w-full flex-col space-y-1 px-4 py-4 border-t text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      <div className="w-full group">
        <div className="flex items-center space-x-2">
          <div className="flex flex-1 items-center space-x-2">
            <Avatar
              round={true}
              size="30"
              name={remarks.user}
            />
            <div>
              <div className="font-bold">
                <span>{remarks.user} </span>
              </div>
              <div className="text-gray-500  focus:ring-0 focus:outline-none text-xs text-left inline-flex items-center">
                {format(new Date(remarks.timestamp), 'dd MMM yyyy h:mm a')}
              </div>
            </div>
          </div>
          <div>
            <XMarkIcon className="w-5 h-5 text-red-500 cursor-pointer" />
          </div>
        </div>

        {/* Message */}
        <div className="pl-10 mt-2">
          <div>{remarks.remarks}</div>
        </div>
      </div>
    </div>
  )
}

export default function Remarks({
  documentData,
}: {
  documentData: DocumentTypes
}) {
  const [remarks, setRemarks] = useState('')
  const [remarksLists, setRemarksLists] = useState<DocumentRemarksTypes[] | []>(
    []
  )

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const { supabase, session, systemUsers } = useSupabase()
  const user: AccountTypes = systemUsers.find(
    (user: AccountTypes) => user.id === session.user.id
  )

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const dispatch = useDispatch()

  const handleSubmitRemarks = async () => {
    if (remarks.trim().length === 0) {
      return
    }

    setSaving(true)

    try {
      const newData = {
        tracker_id: documentData.id,
        user_id: session.user.id,
        timestamp: format(new Date(), 'yyyy-MM-dd h:mm a'),
        user: `${user.firstname} ${user.middlename || ''} ${
          user.lastname || ''
        }`,
        remarks: remarks,
      }

      const { error } = await supabase
        .from('adm_tracker_remarks')
        .insert(newData)

      if (error) throw new Error(error.message)

      const { error: error2 } = await supabase
        .from('adm_trackers')
        .update({ recent_remarks: newData })
        .eq('id', documentData.id)

      if (error2) throw new Error(error.message)

      // Append new remarks to list
      setRemarksLists([...remarksLists, newData])

      // Append to recent_remarks in redux
      const items = [...globallist]
      const foundIndex = items.findIndex((x) => x.id === documentData.id)
      items[foundIndex] = { ...items[foundIndex], recent_remarks: newData }
      dispatch(updateList(items))
    } catch (error) {
      console.error(error)
    } finally {
      setRemarks('')
      setSaving(false)
    }
  }

  useEffect(() => {
    // Fetch remarks
    ;(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('adm_tracker_remarks')
        .select()
        .eq('tracker_id', documentData.id)

      setRemarksLists(data)
      setLoading(false)
    })()
  }, [])

  return (
    <div className="w-full relative">
      <div className="mx-2 mb-10 outline-none overflow-x-hidden overflow-y-auto text-xs text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
        <div className="flex space-x-2 px-4 py-4">
          <span className="font-bold">Remarks:</span>
        </div>
        {loading && <TwoColTableLoading />}
        {!loading && (
          <>
            {/* Remarks Box */}
            <div className="w-full flex-col space-y-2 px-4 mb-5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              <textarea
                onChange={(e) => setRemarks(e.target.value)}
                value={remarks}
                placeholder="Write your remarks here.."
                className="w-full h-20 border resize-none focus:ring-0 focus:outline-none p-2 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
              <div className="flex items-start">
                <span className="flex-1">&nbsp;</span>

                <CustomButton
                  containerStyles="app__btn_green"
                  title="Submit"
                  isDisabled={saving}
                  handleClick={handleSubmitRemarks}
                  btnType="button"
                />
              </div>
            </div>
            {remarksLists.length > 0 ? (
              remarksLists.map((remarks, idx) => (
                <RemarksList
                  key={idx}
                  remarks={remarks}
                />
              ))
            ) : (
              <div className="px-4 pb-4 text-center">No remarks added yet.</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
