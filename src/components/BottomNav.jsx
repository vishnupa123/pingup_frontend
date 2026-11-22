import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, MessageCircle, Search, UserIcon, CirclePlus } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

const mobileNavItems = [
  { to: '/', label: 'Feed', Icon: Home },
  { to: '/messages', label: 'Messages', Icon: MessageCircle },
  { to: '/create-post', label: 'Create', Icon: CirclePlus },
  { to: '/discover', label: 'Discover', Icon: Search },
  { to: '/profile', label: 'Profile', Icon: UserIcon },
]

const BottomNav = () => {
  const { totalUnread } = useNotifications()

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {mobileNavItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[56px] transition-colors ${
                isActive ? 'text-pink-600' : 'text-gray-500 hover:text-pink-500'
              }`
            }
          >
            <span className="relative flex items-center justify-center">
              <Icon className="w-6 h-6" />
              {to === '/messages' && totalUnread > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
