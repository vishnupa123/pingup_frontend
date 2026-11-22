import React from 'react'
import SideBar from '../components/SideBar'
import BottomNav from '../components/BottomNav'
import { Outlet } from 'react-router-dom'
import Loading from '../components/Loading'

const Layout = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {user ? (
        <div className="flex h-screen w-full bg-white overflow-hidden relative">
          
          {/* 1. LEFT SIDEBAR (desktop) */}
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* 2. MAIN CONTENT AREA */}
          <div className="flex-1 w-full bg-slate-50 overflow-y-auto no-scrollbar relative pb-20 sm:pb-0">
            <Outlet />
          </div>

          {/* MOBILE BOTTOM NAV */}
          <BottomNav />

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