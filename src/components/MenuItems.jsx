import React from 'react'
import { menuItemsData } from '../assets/assets'
import { NavLink } from 'react-router-dom'

const MenuItems = ({ sidebarOpen, setSidebarOpen }) => {
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
                    ? 'bg-blue-100 text-pink-600' // Pink background and text when active
                    : 'text-pink-500 hover:bg-blue-300' // Pink text when inactive
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))
        }
      </div>


    </div>
  )
}

export default MenuItems