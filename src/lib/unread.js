// Frontend-only unread tracking. The Message model has no "read" flag, so we
// store the last time each conversation was opened in localStorage.
const STORAGE_KEY = 'pingup_message_seen'

const readMap = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export const getLastSeen = (conversationId) => readMap()[conversationId] || 0

export const markConversationSeen = (conversationId) => {
  if (!conversationId) return
  const map = readMap()
  map[conversationId] = Date.now()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export const countUnread = (messages = [], myId, conversationId) => {
  if (!myId || !conversationId) return 0
  const seen = getLastSeen(conversationId)

  return messages.filter((msg) => {
    if (String(msg?.sender) === String(myId)) return false
    const sentAt = new Date(msg?.createdAt || 0).getTime()
    return sentAt > seen
  }).length
}
