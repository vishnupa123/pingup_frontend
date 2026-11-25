import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Send, Image as ImageIcon, Smile } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { API_URL, authHeaders, isMutualFollow } from '../lib/api'
import { playSendSound } from '../lib/sound'
import { useSocket } from '../context/SocketContext'
import { useMe } from '../context/UserContext'
import { useNotifications } from '../context/NotificationContext'

const mergeMessages = (list) => {
  const byId = new Map()
  list.forEach((msg) => {
    if (msg?._id) byId.set(String(msg._id), msg)
  })
  return [...byId.values()].sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  )
}

// Older backend deployments do not have the explicit seen endpoint yet.
// Falling back to the conversation GET keeps the chat working until Render
// picks up the latest backend commit.
const markConversationSeenOnServer = async (otherUserId) => {
  const config = { headers: authHeaders(), withCredentials: true }
  try {
    await axios.post(`${API_URL}/api/messages/seen/${otherUserId}`, {}, config)
  } catch (error) {
    if (error?.response?.status !== 404) throw error
    await axios.get(`${API_URL}/api/messages/${otherUserId}`, config)
  }
}

const Chat = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { socket, connected, onlineUsers } = useSocket()
  const contextMe = useMe()
  const [me, setMe] = useState(contextMe)
  const { markSeen } = useNotifications()

  const [chatUser, setChatUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const messagesContainerRef = useRef(null)

  // Declared before the effects that depend on it.
  const canMessage = isMutualFollow(me, chatUser)

  // Load the person we are chatting with.
  useEffect(() => {
    if (!userId) return undefined
    let cancelled = false

    const loadUser = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/users/profile/${userId}`, {
          headers: authHeaders(),
          withCredentials: true,
        })
        if (!cancelled) setChatUser(data?.user || null)
      } catch (error) {
        console.error('Error loading chat user:', error)
        if (!cancelled) setChatUser(null)
      }
    }

    loadUser()
    return () => { cancelled = true }
  }, [userId])

  // Always read a fresh copy of the logged-in user. A newly followed friend
  // makes both users connections immediately, but the cached context can be
  // stale until the app reloads.
  useEffect(() => {
    if (!contextMe?.id) return undefined
    let cancelled = false

    const refreshMe = async () => {
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
        console.error('Error refreshing current user:', error)
        if (!cancelled) setMe(contextMe)
      }
    }

    refreshMe()
    return () => { cancelled = true }
  }, [contextMe?.id])

  // Make sure this socket is registered in the user's room even if the
  // initial connect happened before the user id was available.
  useEffect(() => {
    if (!socket?.connected || !me?.id) return
    socket.emit('join', me.id)
  }, [socket, connected, me?.id])

  // Load existing conversation: GET /api/messages/:otherUserId
  useEffect(() => {
    if (!userId || !me?.id) return undefined
    let cancelled = false
    setLoading(true)

    const loadMessages = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/messages/${userId}`, {
          headers: authHeaders(),
          withCredentials: true,
        })
        const list = Array.isArray(data) ? data : []
        if (!cancelled) setMessages((prev) => mergeMessages([...prev, ...list]))
      } catch (error) {
        console.error('Error loading messages:', error)
        if (!cancelled) toast.error(error.response?.data?.message || 'Failed to load messages')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMessages()
    return () => { cancelled = true }
  }, [userId, me?.id])

  // Safety net: poll the open conversation so messages still appear if a
  // socket event is missed (reconnect, room join delay, or stale deployment).
  useEffect(() => {
    if (!userId || !me?.id) return undefined
    let cancelled = false

    const pollMessages = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        const { data } = await axios.get(`${API_URL}/api/messages/${userId}`, {
          headers: authHeaders(),
          withCredentials: true,
        })
        const list = Array.isArray(data) ? data : []
        if (!cancelled && list.length) {
          setMessages((prev) => mergeMessages([...prev, ...list]))
        }
      } catch {
        // The initial load already reports errors; polling stays silent.
      }
    }

    const timer = window.setInterval(pollMessages, 4000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [userId, me?.id])

  // Live updates from socket.io. The server broadcasts every saved message as
  // `receive_message`; we only keep the ones belonging to this conversation.
  useEffect(() => {
    if (!socket || !me?.id || !userId) return undefined

    const markIncomingSeen = async () => {
      try {
        await markConversationSeenOnServer(userId)
      } catch (error) {
        console.error('Error marking message seen:', error)
      }
    }

    const onReceive = (msg) => {
      const fromMe = String(msg?.sender) === String(me.id)
      const toMe = String(msg?.receiver) === String(me.id)
      if (!fromMe && !toMe) return

      const otherPerson = String(fromMe ? msg.receiver : msg.sender)
      if (otherPerson !== String(userId)) return

      setMessages((prev) => mergeMessages([...prev, msg]))
      if (!fromMe && toMe) markIncomingSeen()
    }

    const onSeen = (data) => {
      if (String(data?.conversationWith) !== String(userId)) return

      setMessages((prev) =>
        prev.map((msg) => {
          const mineToThem =
            String(msg.sender) === String(me.id) && String(msg.receiver) === String(userId)
          return mineToThem ? { ...msg, seenAt: data.seenAt, expiresAt: data.expiresAt } : msg
        })
      )
    }

    socket.on('receive_message', onReceive)
    socket.on('messages_seen', onSeen)
    return () => {
      socket.off('receive_message', onReceive)
      socket.off('messages_seen', onSeen)
    }
  }, [socket, me?.id, userId])

  // Opening a conversation (or receiving a message while it is open) clears its badge.
  useEffect(() => {
    if (!canMessage || !userId || loading) return

    markSeen(userId)
    markConversationSeenOnServer(userId).catch((error) =>
      console.error('Error marking conversation seen:', error)
    )
  }, [canMessage, userId, loading, messages.length, markSeen])

  // Remove messages locally once their 2-day post-seen expiry has passed.
  useEffect(() => {
    const removeExpired = () => {
      const now = Date.now()
      setMessages((prev) =>
        prev.filter((msg) => !msg.expiresAt || new Date(msg.expiresAt).getTime() > now)
      )
    }

    const timer = window.setInterval(removeExpired, 60000)
    return () => window.clearInterval(timer)
  }, [])

  // Scroll only the messages list. scrollIntoView would also scroll the outer
  // Layout container and hide the contact/header behind the sticky header.
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [messages])

  const sendMsg = async (e) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || !userId || !me?.id || !canMessage) return

    setSending(true)
    try {
      // Always save through REST first. The response contains the saved message,
      // so it appears immediately even if the socket is slow or not joined yet.
      // The server also broadcasts receive_message, and mergeMessages dedupes it.
      const { data } = await axios.post(
        `${API_URL}/api/messages/send`,
        { sender: me.id, receiver: userId, message: body },
        { headers: authHeaders(), withCredentials: true }
      )
      if (data?.data) setMessages((prev) => mergeMessages([...prev, data.data]))
      playSendSound()
      setText('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const displayName = chatUser?.fullName || chatUser?.full_name || chatUser?.username || 'Conversation'
  const avatar = chatUser?.profilePic || chatUser?.profile_picture || 'https://via.placeholder.com/150'
  const otherOnline = onlineUsers.includes(String(userId))

  return (
    <div
      className='flex flex-col w-full md:w-[70%] bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm relative h-[calc(100dvh-8.5rem)] max-h-[calc(100dvh-8.5rem)] sm:h-[100dvh] sm:max-h-[100dvh]'
    >
      {/* Header */}
      <div className='sticky top-0 z-10 bg-white px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center gap-3 shrink-0'>
        <button
          type='button'
          onClick={() => navigate(`/profile/${userId}`)}
          className='relative block shrink-0 cursor-pointer'
          aria-label={`View ${displayName}'s profile`}
        >
          <img src={avatar} alt={displayName} className='w-10 h-10 md:w-11 md:h-11 rounded-full object-cover hover:opacity-90 transition' />
          {otherOnline && (
            <span className='pointer-events-none absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white' />
          )}
        </button>
        <div className='flex flex-col min-w-0'>
          <p className='font-semibold text-gray-800 text-sm leading-tight truncate'>{displayName}</p>
          <p className='text-[11px] text-gray-400 mt-0.5 truncate'>
            {chatUser?.username ? `@${chatUser.username}` : 'Conversation'}
            {connected ? (otherOnline ? ' · Online' : ' · Offline') : ' · Connecting...'}
          </p>
        </div>
      </div>

      {/* Messages Feed */}
      <div
        ref={messagesContainerRef}
        className='flex-1 min-h-0 p-3 md:p-5 overflow-y-auto space-y-3 bg-slate-50/30'
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehavior: 'contain' }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {loading && <p className='text-center text-xs text-gray-400 py-4'>Loading messages...</p>}

        {!loading && messages.length === 0 && (
          <p className='text-center text-xs text-gray-400 py-4'>No messages yet. Say hello 👋</p>
        )}

        {messages.map((msg) => {
          const isMe = String(msg.sender) === String(me?.id)
          const time = msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''
          const rawText = typeof msg.message === 'string' ? msg.message : ''
          const displayText = rawText.startsWith('enc:v1:')
            ? 'Unable to display message'
            : rawText

          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] p-2.5 shadow-sm rounded-2xl ${
                isMe
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
              }`}>
                <p className='px-1.5 py-0.5 break-words text-xs leading-relaxed'>{displayText}</p>
                <span className={`block text-[9px] mt-1 text-right px-1.5 ${isMe ? 'text-pink-100' : 'text-gray-400'}`}>
                  {time}
                </span>
                {isMe && msg.seenAt && (
                  <span className='block text-[9px] text-right px-1.5 text-pink-100'>Seen</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Input — only shown when both users follow each other */}
      {canMessage ? (
      <form
        onSubmit={sendMsg}
        className='sticky bottom-0 z-10 bg-white px-3 pt-2 pb-3 border-t border-gray-100 flex flex-col gap-2 shrink-0 relative'
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className='flex items-center gap-1.5 w-full'>
          <div className='flex items-center gap-0.5 text-gray-400 flex-shrink-0'>
            <button
              type='button'
              disabled
              title='Image messages are not supported by the server yet'
              className='p-2 text-gray-300 cursor-not-allowed rounded-lg'
            >
              <ImageIcon size={18} />
            </button>
            <button type='button' className='p-2 hover:bg-pink-50 hover:text-pink-500 rounded-lg transition-colors cursor-pointer'>
              <Smile size={18} />
            </button>
          </div>

          <input
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${displayName}...`}
            className='flex-1 bg-gray-50 border border-gray-100 text-sm md:text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-pink-300 transition-colors text-gray-700 placeholder-gray-400 min-w-0'
          />

          <button
            type='submit'
            disabled={!text.trim() || sending}
            className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
              text.trim() && !sending
                ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-sm cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={15} />
          </button>
        </div>
      </form>
      ) : (
        <div className='sticky bottom-0 z-10 bg-white px-4 py-4 border-t border-gray-100 text-center text-xs text-gray-500 shrink-0'>
          Follow each other to send messages.
        </div>
      )}
    </div>
  )
}

export default Chat
