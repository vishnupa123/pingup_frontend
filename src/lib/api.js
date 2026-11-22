// Shared backend configuration for the frontend.
// VITE_API_URL comes from dummy/.env and defaults to the local Express server.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const getToken = () => localStorage.getItem('token')

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const user = JSON.parse(raw)
    return { ...user, id: user.id || user._id || user.userId }
  } catch {
    return null
  }
}

export const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const normalizeId = (value) =>
  String(typeof value === 'object' ? value?._id || value?.id || '' : value || '')

export const hasId = (list = [], targetId) =>
  list.some((item) => normalizeId(item) === normalizeId(targetId))

// Messaging is only allowed when both users follow each other.
export const isMutualFollow = (me, other) => {
  if (!me || !other) return false

  const meId = normalizeId(me.id || me._id)
  const otherId = normalizeId(other._id || other.id)
  if (!meId || !otherId || meId === otherId) return false

  const iFollowThem = hasId(me.following, otherId)
  const theyFollowMe = hasId(other.followers, meId)
  const theyFollowMeAlt = hasId(me.followers, otherId)
  const iFollowThemAlt = hasId(other.following, meId)

  return (iFollowThem && theyFollowMe) || (theyFollowMeAlt && iFollowThemAlt)
}
