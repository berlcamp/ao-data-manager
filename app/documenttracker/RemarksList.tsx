import { DocumentRemarksTypes } from '@/types'
import { format } from 'date-fns'
import Avatar from 'react-avatar'

export default function RemarksList({
  remarks,
}: {
  remarks: DocumentRemarksTypes
}) {
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
        </div>

        {/* Message */}
        <div className="pl-10 mt-2">
          <div>{remarks.remarks}</div>
        </div>
      </div>
    </div>
  )
}
