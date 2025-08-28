'use client'
import { superAdmins } from '@/constants/TrackerConstants'
import { FaGasPump } from 'react-icons/fa6'

import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { Cog6ToothIcon, DocumentDuplicateIcon } from '@heroicons/react/20/solid'
import { Calendar } from 'lucide-react'
import Link from 'next/link'

const MainMenu: React.FC = () => {
  const { session } = useSupabase()
  const { hasAccess } = useFilter()

  const email: string = session.user.email

  return (
    <div className="py-1">
      <div className="px-4 py-4">
        <div className="text-gray-700 text-xl font-semibold">Menu</div>
        <div className="lg:flex space-x-2">
          <div className="px-2 py-4 mt-2 lg:w-96 border text-gray-600 rounded-lg bg-white shadow-md flex flex-col space-y-2">
            {hasAccess('ris') && (
              <Link href="/rispo">
                <div className="app__menu_item">
                  <div className="pt-1">
                    <FaGasPump className="w-8 h-6" />
                  </div>
                  <div>
                    <div className="app__menu_item_label">
                      Fuel Requisition & Issue Slip
                    </div>
                    <div className="app__menu_item_label_description">
                      Fuel P.O. / Requisition & Issue Slip
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {hasAccess('voters') && (
              <Link href="/voters">
                <div className="app__menu_item">
                  <div className="pt-1">
                    <DocumentDuplicateIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="app__menu_item_label">
                      Registered Voters
                    </div>
                    <div className="app__menu_item_label_description">
                      Registered Voters
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {hasAccess('tracker') && (
              <Link href="/documenttracker">
                <div className="app__menu_item">
                  <div className="pt-1">
                    <DocumentDuplicateIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="app__menu_item_label">Document Tracker</div>
                    <div className="app__menu_item_label_description">
                      Document Tracker
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {hasAccess('medicine') && (
              <Link href="/medicineassistance">
                <div className="app__menu_item">
                  <div className="pt-1">
                    <DocumentDuplicateIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="app__menu_item_label">
                      AO Medication Assistance
                    </div>
                    <div className="app__menu_item_label_description">
                      AO Medication Assistance
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {hasAccess('medicine') && (
              <Link href="/dswdendorsement">
                <div className="app__menu_item">
                  <div className="pt-1">
                    <DocumentDuplicateIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="app__menu_item_label">
                      DSWD/PCSO Endorsements
                    </div>
                    <div className="app__menu_item_label_description">
                      DSWD/PCSO Endorsements
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {hasAccess('hospatization') && (
              <Link href="/hospatization">
                <div className="app__menu_item">
                  <div className="pt-1">
                    <DocumentDuplicateIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="app__menu_item_label">
                      Hospitalization Program
                    </div>
                    <div className="app__menu_item_label_description">
                      Hospitalization Program
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {hasAccess('supply') && (
              <Link href="/supply">
                <div className="app__menu_item">
                  <div className="pt-1">
                    <DocumentDuplicateIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="app__menu_item_label">
                      Supply Price Monitor
                    </div>
                    <div className="app__menu_item_label_description">
                      Supply Price Monitor
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {hasAccess('activities') && (
              <Link href="/activities">
                <div className="app__menu_item">
                  <div className="pt-1">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="app__menu_item_label">
                      Activities Calendar
                    </div>
                    <div className="app__menu_item_label_description">
                      Activities Calendar
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {superAdmins.includes(email) && (
              <>
                <Link href="/settings/system">
                  <div className="app__menu_item">
                    <div className="pt-1">
                      <Cog6ToothIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="app__menu_item_label">
                        System Settings
                      </div>
                      <div className="app__menu_item_label_description">
                        System Settings - Admin Only
                      </div>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default MainMenu
