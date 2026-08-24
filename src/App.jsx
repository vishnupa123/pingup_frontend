import React, { useEffect, useState } from 'react'
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import Chat from './pages/Chat'
import Connection from './pages/Connection'
import Discover from './pages/Discover'
import Profilee from './pages/Profilee'
import CreatePost from './pages/CreatePost'
import Layout from './pages/Layout'
import { useUser, useClerk } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import AiWorld from './pages/AiWorld'
import Loading from './components/Loading'

const App = () => {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const token = localStorage.getItem('token');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Wait for Clerk to finish loading, then determine authentication status
  useEffect(() => {
    // If Clerk has finished loading, we can proceed
    if (clerkLoaded) {
      setIsCheckingAuth(false);
    }
  }, [clerkLoaded]);

  // Determine if user is authenticated
  const isAuthenticated = !!token || !!user;

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <Toaster/>
      <Router>
        <Routes>
          {/* Always show login page at /login */}
          <Route path='/login' element={<Login />} />
          
          {/* Protected routes - redirect to login if not authenticated */}
          <Route path='/' element={isAuthenticated ? <Layout/> : <Navigate to="/login" replace/> } >  
            <Route index element={<Feed/>} />
            <Route path='messages' element={<Messages />} />
            <Route path='messages/:userId' element={<Chat />} />
            <Route path='connections' element={<Connection/>} />
            <Route path='discover' element={<Discover/>} />
            
            {/* FIX: Handle both routes to avoid "No routes matched" error */}
            <Route path='profile' element={<Profilee/>} />
            <Route path='profile/:profileId' element={<Profilee/>} />
            
            <Route path='create-post' element={<CreatePost/>} />
            <Route path='ai-world' element={<AiWorld/>} />
          </Route>
          
          {/* Catch all unmatched routes and redirect to login */}
          <Route path='*' element={<Navigate to="/login" replace/>} />
        </Routes>
      </Router>
    </div>
  )
}

export default App