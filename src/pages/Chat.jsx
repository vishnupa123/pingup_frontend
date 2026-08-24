import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyChatHistoryData, dummyConnectionsData, dummyMessagesData } from '../assets/assets'
import { Send, Image, Smile, X, Maximize2 } from 'lucide-react'

const Chat = () => {
  const { userId } = useParams()

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [selectedImg, setSelectedImg] = useState(null)
  const [chatUser, setChatUser] = useState(null)
  const [activeLightboxImg, setActiveLightboxImg] = useState(null)

  const messageEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (userId) {
      const foundUser = dummyConnectionsData.find(u => u._id === userId)
      setChatUser(foundUser)

      if (dummyChatHistoryData[userId]) {
        setMessages(dummyChatHistoryData[userId])
      } else {
        setMessages(dummyMessagesData)
      }
    }
  }, [userId])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (activeLightboxImg) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [activeLightboxImg])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImg(URL.createObjectURL(file))
    }
  }

  const sendMsg = async (e) => {
    e.preventDefault()
    if (!text.trim() && !selectedImg) return

    const newMsg = {
      _id: Date.now().toString(),
      senderId: 'me',
      text: text.trim(),
      image: selectedImg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, newMsg])
    setText('')
    setSelectedImg(null)
  }

  if (!chatUser) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50 text-gray-400 text-xs'>
        Loading conversation profile records...
      </div>
    )
  }

  return (
    <div className='flex flex-col w-full md:w-[70%] bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm relative'
      style={{ height: '100dvh', maxHeight: '100dvh' }}
    >
      
      {/* Header */}
      <div className='bg-white px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center gap-3 shrink-0'>
        <img 
          src={chatUser.profile_picture} 
          alt={chatUser.full_name} 
          className='w-10 h-10 md:w-11 md:h-11 rounded-full object-cover flex-shrink-0' 
        />
        <div className='flex flex-col min-w-0'>
          <p className='font-semibold text-gray-800 text-sm leading-tight truncate'>{chatUser.full_name}</p>
          <p className='text-[11px] text-gray-400 mt-0.5 truncate'>@{chatUser.username}</p>
        </div>
      </div>

      {/* Messages Feed */}
      <div 
        className='flex-1 p-3 md:p-5 overflow-y-auto space-y-3 bg-slate-50/30'
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          overscrollBehavior: 'contain',
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {messages.map((msg, index) => {
          const isMe = msg.senderId === 'me' || msg.sender === 'me' || msg.sender_id === 'user_1'
          const imgUrl = msg.image || msg.media_url
          const hasText = msg.text && msg.text !== "Empty message text data"
          const isImageOnly = imgUrl && !hasText

          return (
            <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`text-xs leading-relaxed relative group ${
                  isImageOnly
                    ? 'p-0 bg-transparent border-none shadow-none overflow-visible max-w-[55%] sm:max-w-[45%] md:max-w-[35%]'
                    : `max-w-[85%] sm:max-w-[75%] md:max-w-[70%] p-2.5 shadow-sm rounded-2xl ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                      }`
                }`}
              >
                {imgUrl && (
                  <div className="relative overflow-hidden rounded-xl cursor-zoom-in">
                    <img 
                      src={imgUrl} 
                      alt="Chat attachment" 
                      onClick={() => setActiveLightboxImg(imgUrl)}
                      className={`w-full max-h-48 object-cover transition-transform duration-200 active:scale-[0.98] hover:scale-[1.02] ${
                        hasText ? 'mb-1.5' : 'm-0 shadow-sm'
                      }`} 
                    />
                    <div 
                      onClick={() => setActiveLightboxImg(imgUrl)}
                      className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none"
                    >
                      <Maximize2 size={16} className="text-white drop-shadow-md" />
                    </div>
                  </div>
                )}

                {hasText && <p className="px-1.5 py-0.5 break-words">{msg.text}</p>}
                
                <span 
                  className={`block text-[9px] mt-1 text-right ${
                    isImageOnly 
                      ? 'absolute bottom-2 right-2 text-white bg-black/50 backdrop-blur-[2px] px-1.5 py-0.5 rounded-md font-medium tracking-wide shadow-xs' 
                      : isMe ? 'text-pink-100 px-1.5' : 'text-gray-400 px-1.5'
                  }`}
                >
                  {msg.timestamp 
                    ? (msg.timestamp.includes('T') 
                        ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : msg.timestamp) 
                    : '10:00 AM'}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messageEndRef} />
      </div>

      {/* Footer Input */}
      <form 
        onSubmit={sendMsg} 
        className='bg-white px-3 pt-2 pb-3 border-t border-gray-100 flex flex-col gap-2 shrink-0 relative'
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        {selectedImg && (
          <div className='flex items-center gap-2 px-1 pt-1 pb-0.5'>
            <div className='relative inline-block group'>
              <img 
                src={selectedImg} 
                alt="Selected attachment preview" 
                className='w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm'
              />
              <button
                type='button'
                onClick={() => setSelectedImg(null)}
                className='absolute -top-1.5 -right-1.5 bg-gray-900/80 hover:bg-red-500 text-white rounded-full p-0.5 transition-colors cursor-pointer shadow'
              >
                <X size={10} />
              </button>
            </div>
          </div>
        )}

        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleImageChange} 
          className="hidden" 
        />

        <div className='flex items-center gap-1.5 w-full'>
          <div className='flex items-center gap-0.5 text-gray-400 flex-shrink-0'>
            <button 
              type='button' 
              onClick={() => fileInputRef.current?.click()}
              className='p-2 hover:bg-pink-50 hover:text-pink-500 rounded-lg transition-colors cursor-pointer'
            >
              <Image size={18} />
            </button>
            <button type='button' className='p-2 hover:bg-pink-50 hover:text-pink-500 rounded-lg transition-colors cursor-pointer'>
              <Smile size={18} />
            </button>
          </div>

          <input
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={selectedImg ? "Add a caption..." : `Message ${chatUser.full_name}...`}
            className='flex-1 bg-gray-50 border border-gray-100 text-base md:text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-pink-300 transition-colors text-gray-700 placeholder-gray-400 min-w-0'
          />

          <button
            type='submit'
            disabled={!text.trim() && !selectedImg}
            className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
              text.trim() || selectedImg
                ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-sm cursor-pointer' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={15} />
          </button>
        </div>
      </form>

      {/* Lightbox */}
      {activeLightboxImg && (
        <div 
          className='fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4'
          onClick={() => setActiveLightboxImg(null)}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <button 
            onClick={() => setActiveLightboxImg(null)}
            className='absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors cursor-pointer'
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <X size={22} />
          </button>

          <div 
            className='flex items-center justify-center relative w-full h-full'
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={activeLightboxImg} 
              alt="Full size preview" 
              className='max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none'
              style={{ maxHeight: 'calc(100dvh - 80px)' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat