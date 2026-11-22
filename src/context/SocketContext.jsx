import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { API_URL, getToken } from '../lib/api'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const token = getToken()

  useEffect(() => {
    if (!token) return undefined

    const instance = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      // Delay connecting until after mount so React StrictMode's dev-only
      // mount/unmount/remount does not abort a half-open websocket.
      autoConnect: false,
    })

    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)
    const handleError = (error) => console.error('Socket connection error:', error.message)

    instance.on('connect', handleConnect)
    instance.on('disconnect', handleDisconnect)
    instance.on('connect_error', handleError)
    setSocket(instance)

    const connectTimer = setTimeout(() => instance.connect(), 0)

    return () => {
      clearTimeout(connectTimer)
      instance.off('connect', handleConnect)
      instance.off('disconnect', handleDisconnect)
      instance.off('connect_error', handleError)
      instance.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [token])

  const value = useMemo(() => ({ socket, connected }), [socket, connected])

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext)
