import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
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

const Chat = () => {
  const { userId } = useParams()
  const { socket, connected } = useSocket()
  const me = useMe()
  const { markSeen } = useNotifications()

  const [chatUser, setChatUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const messageEndRef = useRef(null)

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

  // Live updates from socket.io. The server broadcasts every saved message as
  // `receive_message`; we only keep the ones belonging to this conversation.
  useEffect(() => {
    if (!socket || !me?.id || !userId || !canMessage) return undefined

    const onReceive = (msg) => {
      const fromMe = String(msg?.sender) === String(me.id)
      const toMe = String(msg?.receiver) === String(me.id)
      if (!fromMe && !toMe) return

      const otherPerson = String(fromMe ? msg.receiver : msg.sender)
      if (otherPerson !== String(userId)) return

      setMessages((prev) => mergeMessages([...prev, msg]))
    }

    socket.on('receive_message', onReceive)
    return () => socket.off('receive_message', onReceive)
  }, [socket, me?.id, userId, canMessage])

  // Opening a conversation (or receiving a message while it is open) clears its badge.
  useEffect(() => {
    if (canMessage && userId && !loading) markSeen(userId)
  }, [canMessage, userId, loading, messages.length, markSeen])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMsg = async (e) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || !userId || !me?.id || !canMessage) return

    setSending(true)
    try {
      if (socket?.connected) {
        // The server saves to MongoDB and broadcasts `receive_message` to everyone,
        // including this tab, so the message is added by the listener above.
        socket.emit('send_message', {
          sender: me.id,
          receiver: userId,
          message: body,
        })
        playSendSound()
        setText('')
      } else {
        // Fallback when the socket is not connected: use the REST API.
        const { data } = await axios.post(
          `${API_URL}/api/messages/send`,
          { sender: me.id, receiver: userId, message: body },
          { headers: authHeaders(), withCredentials: true }
        )
        if (data?.data) setMessages((prev) => mergeMessages([...prev, data.data]))
        playSendSound()
        setText('')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const displayName = chatUser?.fullName || chatUser?.full_name || chatUser?.username || 'Conversation'
  const avatar = chatUser?.profilePic || chatUser?.profile_picture || 'https://via.placeholder.com/150'

  return (
    <div
      className='flex flex-col w-full md:w-[70%] bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm relative'
      style={{ height: '100dvh', maxHeight: '100dvh' }}
    >
      {/* Header */}
      <div className='bg-white px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center gap-3 shrink-0'>
        <img src={avatar} alt={displayName} className='w-10 h-10 md:w-11 md:h-11 rounded-full object-cover flex-shrink-0' />
        <div className='flex flex-col min-w-0'>
          <p className='font-semibold text-gray-800 text-sm leading-tight truncate'>{displayName}</p>
          <p className='text-[11px] text-gray-400 mt-0.5 truncate'>
            {chatUser?.username ? `@${chatUser.username}` : 'Conversation'}
            {connected ? ' · Online' : ' · Connecting...'}
          </p>
        </div>
      </div>

      {/* Messages Feed */}
      <div
        className='flex-1 p-3 md:p-5 overflow-y-auto space-y-3 bg-slate-50/30'
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

          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] p-2.5 shadow-sm rounded-2xl ${
                isMe
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
              }`}>
                <p className='px-1.5 py-0.5 break-words text-xs leading-relaxed'>{msg.message}</p>
                <span className={`block text-[9px] mt-1 text-right px-1.5 ${isMe ? 'text-pink-100' : 'text-gray-400'}`}>
                  {time}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messageEndRef} />
      </div>

      {/* Footer Input — only shown when both users follow each other */}
      {canMessage ? (
      <form
        onSubmit={sendMsg}
        className='bg-white px-3 pt-2 pb-3 border-t border-gray-100 flex flex-col gap-2 shrink-0 relative'
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
            className='flex-1 bg-gray-50 border border-gray-100 text-base md:text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-pink-300 transition-colors text-gray-700 placeholder-gray-400 min-w-0'
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
        <div className='bg-white px-4 py-4 border-t border-gray-100 text-center text-xs text-gray-500 shrink-0'>
          Follow each other to send messages.
        </div>
      )}
    </div>
  )
}

export default Chat
