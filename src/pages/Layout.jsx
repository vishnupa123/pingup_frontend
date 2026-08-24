import React from 'react'
import SideBar from '../components/SideBar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Loading from '../components/Loading'

const Layout = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {user ? (
        <div className="flex h-screen w-full bg-white overflow-hidden relative">
          
          {/* 1. LEFT SIDEBAR */}
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* 2. MAIN CONTENT AREA (Middle Feed Workspace) */}
          {/* 🛠️ FIXED: Ensured full width allocation to close empty gaps next to the sidebar */}
          <div className="flex-1 w-full bg-slate-50 overflow-y-auto no-scrollbar relative">
            <Outlet />
          </div>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 right-4 z-50 p-2 bg-white rounded-xl shadow-md border border-pink-50 sm:hidden transition-transform active:scale-90 cursor-pointer"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-pink-500" />
            ) : (
              <Menu className="w-5 h-5 text-pink-500" />
            )}
          </button>

        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          <Loading />
        </div>
      )}
    </div>
  )
}

export default Layout