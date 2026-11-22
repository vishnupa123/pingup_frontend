import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { API_URL, authHeaders, getCurrentUser, getToken } from '../lib/api'

const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const [me, setMe] = useState(() => getCurrentUser())
  const token = getToken()

  useEffect(() => {
    if (!token) return undefined
    let cancelled = false

    const loadMe = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/users/me`, {
          headers: authHeaders(),
          withCredentials: true,
        })
        if (data?.user && !cancelled) {
          const fresh = { ...data.user, id: data.user._id || data.user.id }
          localStorage.setItem('user', JSON.stringify(fresh))
          setMe(fresh)
        }
      } catch (error) {
        console.error('Error loading current user:', error)
      }
    }

    loadMe()
    return () => { cancelled = true }
  }, [token])

  const value = useMemo(() => ({ me, setMe }), [me])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useMe = () => useContext(UserContext)?.me
