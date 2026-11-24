import axios from 'axios'
import { API_URL, authHeaders } from './api'

export const getVideoUrl = (post) =>
  [
    post?.video,
    post?.mediaType === 'video' ? post?.media_url : null,
    post?.media_type === 'video' ? post?.media_url : null,
  ].find(Boolean) || null

// Feed is paginated, so keep fetching until every video post is loaded.
export const fetchVideoPosts = async () => {
  const allPosts = []
  let page = 1

  while (page <= 50) {
    const res = await axios.get(`${API_URL}/api/posts?page=${page}&limit=20`, {
      headers: authHeaders(),
    })
    const posts = Array.isArray(res.data?.posts)
      ? res.data.posts
      : Array.isArray(res.data)
        ? res.data
        : []

    allPosts.push(...posts)
    if (!res.data?.hasMore) break
    page += 1
  }

  return allPosts
    .map((post) => {
      const videoUrl = getVideoUrl(post)
      return videoUrl ? { ...post, videoUrl } : null
    })
    .filter(Boolean)
}

export const shuffleItems = (items) => {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
