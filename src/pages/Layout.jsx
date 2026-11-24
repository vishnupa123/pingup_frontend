import React from 'react'
import SideBar from '../components/SideBar'
import BottomNav from '../components/BottomNav'
import { Outlet, useNavigate } from 'react-router-dom'
import { CirclePlus } from 'lucide-react'
import Loading from '../components/Loading'
import { assets } from '../assets/assets'

const Layout = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const touchStartRef = React.useRef({ x: 0, y: 0 })
  const navigate = useNavigate()

  // Swipe from the left edge to open the sidebar; swipe left to close it.
  const handleTouchStart = (event) => {
    const touch = event.touches?.[0]
    if (!touch) return
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (event) => {
    const touch = event.changedTouches?.[0]
    if (!touch) return

    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return

    if (!sidebarOpen && touchStartRef.current.x <= 28 && deltaX > 0) {
      setSidebarOpen(true)
    } else if (sidebarOpen && deltaX < 0) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {user ? (
        <div
          className="flex h-screen w-full bg-white overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          {/* 1. LEFT SIDEBAR (desktop / slide-in mobile) */}
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-20 sm:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* 2. MOBILE HEADER — icons stay fixed while content scrolls */}
          <header className="sm:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur border-b border-gray-100 flex items-center px-4">
            <img
              src={assets.logo}
              alt="PingUp"
              onClick={() => { setSidebarOpen(false); navigate('/') }}
              className="absolute left-[6px] top-1/2 w-24 -translate-y-1/2 cursor-pointer"
            />
            <button
              type='button'
              onClick={() => { setSidebarOpen(false); navigate('/create-post') }}
              className='absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-pink-600 hover:bg-pink-50 cursor-pointer'
              aria-label='Create post'
            >
              <CirclePlus className='w-6 h-6' />
            </button>
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
