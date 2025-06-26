import { ListChecks } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SupplySidebar() {
  const currentRoute = usePathname()

  return (
    <div className="px-2 mt-12">
      <ul className="space-y-2 border-gray-700">
        <li>
          <div className="flex items-center text-gray-500 font-semibold items-centers space-x-1 px-2">
            <ListChecks className="w-4 h-4" />
            <span>Supply Price Monitor</span>
          </div>
        </li>
        <li>
          <Link
            href="/supply"
            className={`app__menu_link ${
              currentRoute === '/supply' ? 'app_menu_link_active' : ''
            }`}>
            <span className="flex-1 ml-3 whitespace-nowrap">Supplies</span>
          </Link>
        </li>
      </ul>
    </div>
  )
}
