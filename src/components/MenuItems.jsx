import React from 'react'
import { menuItemsData } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'

const MenuItems = ({ sidebarOpen, setSidebarOpen }) => {
  const { totalUnread } = useNotifications()

  return (
    <div>
      <div className='px-6 space-y-1 font-medium'>
        {
          menuItemsData.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `px-3.5 py-2 flex items-center gap-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-pink-600'
                    : 'text-pink-500 hover:bg-blue-300'
                }`
              }
            >
              <span className='relative flex items-center'>
                <Icon className='w-5 h-5' />
                {to === '/messages' && totalUnread > 0 && (
                  <span className='absolute -top-2 -right-2.5 min-w-[17px] h-[17px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow'>
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </NavLink>
          ))
        }
      </div>
    </div>
  )
}

export default MenuItems
