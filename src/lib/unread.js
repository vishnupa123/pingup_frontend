// Unread state is stored on the server as Message.seenAt so it survives
// logout, reinstalls and different devices. localStorage is only a small
// compatibility helper for migrating old locally-seen conversations.
const storageKey = (myId) => `pingup_message_seen:${myId || 'anon'}`

const readMap = (myId) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey(myId)) || '{}')
  } catch {
    return {}
  }
}

export const getLastSeen = (conversationId, myId) => readMap(myId)[conversationId] || 0

export const markConversationSeen = (conversationId, myId) => {
  if (!conversationId) return
  const key = storageKey(myId)
  const map = readMap(myId)
  map[conversationId] = Date.now()
  localStorage.setItem(key, JSON.stringify(map))
}

export const countUnread = (messages = [], myId, conversationId) => {
  if (!myId) return 0

  return messages.filter((msg) => {
    if (String(msg?.sender) === String(myId)) return false
    return !msg?.seenAt
  }).length
}
