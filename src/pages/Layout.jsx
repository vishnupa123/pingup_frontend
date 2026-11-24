import React from 'react'
import SideBar from '../components/SideBar'
import BottomNav from '../components/BottomNav'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Loading from '../components/Loading'
import { assets } from '../assets/assets'

const Layout = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const navigate = useNavigate()

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {user ? (
        <div className="flex h-screen w-full bg-white overflow-hidden relative">

          {/* 1. LEFT SIDEBAR (desktop / slide-in mobile) */}
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-20 sm:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* 2. MOBILE HEADER — icons stay fixed while content scrolls */}
          <header className="sm:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur border-b border-gray-100 flex items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-50 cursor-pointer"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
            <img
              src={assets.logo}
              alt="PingUp"
              onClick={() => { setSidebarOpen(false); navigate('/') }}
              className="w-24 cursor-pointer"
            />
          </header>

          {/* 3. MAIN CONTENT AREA */}
          <div className="flex-1 w-full bg-slate-50 overflow-y-auto no-scrollbar relative pt-14 sm:pt-0 pb-20 sm:pb-0">
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
