import logo from './logo.svg'
import sample_cover from './sample_cover.jpg'
import sample_profile from './sample_profile.jpg'
import bgImage from './bgImage.png'
import group_users from './group_users.png'
import sponsored_img from './sponsored_img.png'
import { Home, MessageCircle, Search, UserIcon, Users } from 'lucide-react'

// ✅ IMAGE & LOGO ASSETS CONTAINER
export const assets = {
  logo,
  sample_cover,
  sample_profile,
  bgImage,
  group_users,
  sponsored_img
}

// ✅ NAVIGATION LINKS ARRAY
export const menuItemsData = [
  { to: '/', label: 'Feed', Icon: Home },
  { to: '/messages', label: 'Messages', Icon: MessageCircle },
  { to: '/connections', label: 'Connections', Icon: Users },
  { to: '/discover', label: 'Discover', Icon: Search },
  { to: '/profile', label: 'Profile', Icon: UserIcon },


]

// ✅ MAIN ACCOUNT LOGGED-IN USER (John Warren)
export const dummyUserData = {
  _id: "user_1",
  email: "admin@example.com",
  full_name: "John Warren",
  username: "john_warren",
  bio: "🌍 Dreamer | 📚 Learner | 🚀 Doer\nExploring life one step at a time.",
  profile_picture: sample_profile,
  cover_photo: sample_cover,
  location: "New York, NY",
  followers: ["user_2", "user_3", "user_4"],
  following: ["user_3", "user_5"],
  connections: ["user_3"],
  posts: [],
  is_verified: true,
  createdAt: "2025-07-09T09:26:59.231Z",
  updatedAt: "2025-07-21T06:56:50.017Z",
}

// ==========================================
// ✅ ACTIVE INDIVIDUAL PROFILES (OTHER USERS)
// ==========================================
export const dummyUser2Data = {
  _id: "user_2",
  email: "richard@example.com",
  username: "richard_h",
  full_name: "Richard Hendricks",
  bio: "Silicon Valley coder life.",
  profile_picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
  cover_photo: sample_cover,
  location: "California",
  is_verified: true,
}

export const dummyUser3Data = {
  _id: "user_3",
  email: "alexa@example.com",
  username: "alexa_james",
  full_name: "Alexa James",
  bio: "Product Design Lead & Writer.",
  profile_picture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop",
  cover_photo: sample_cover,
  location: "London, UK",
  is_verified: true,
}

export const dummyUser4Data = {
  _id: "user_4",
  email: "marcus@example.com",
  username: "marcus_dev",
  full_name: "Marcus Aurelius",
  bio: "Stoic Developer.",
  profile_picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
  cover_photo: sample_cover,
  location: "Rome",
  is_verified: false,
}

export const dummyUser5Data = {
  _id: "user_5",
  email: "sarah@example.com",
  username: "sarah_design",
  full_name: "Sarah Jenkins",
  bio: "Visual Artist & UI Strategist.",
  profile_picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
  cover_photo: sample_cover,
  location: "Austin, TX",
  is_verified: true,
}

export const dummyUser6Data = {
  _id: "user_6",
  email: "vibe@example.com",
  username: "tech_vibe",
  full_name: "Vibe Tech",
  bio: "Tech reviews and media curation hub.",
  profile_picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200",
  cover_photo: sample_cover,
  location: "San Francisco, CA",
  is_verified: false,
}

export const dummyUser7Data = {
  _id: "user_7",
  email: "nina@example.com",
  username: "coding_nina",
  full_name: "Nina Williams",
  bio: "Fullstack Engineer | Fitness Fanatic.",
  profile_picture: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200",
  cover_photo: sample_cover,
  location: "Tokyo, JP",
  is_verified: true,
}

export const dummyNewUserData = {
  _id: "user_8",
  email: "newuser@example.com",
  username: "new_user",
  full_name: "New User",
  bio: "👋 Just joined the platform!",
  profile_picture: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200",
  cover_photo: "https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=800",
  location: "Unknown",
  followers: [],
  following: [],
  connections: [],
  posts: [],
  is_verified: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// ==========================================
// ✅ GLOBAL CONNECTIONS & RELATIONSHIPS LISTS
// ==========================================
export const dummyConnectionsData = [
  dummyUser2Data,
  dummyUser3Data,
  dummyUser4Data,
  dummyUser5Data,
  dummyUser6Data,
  dummyUser7Data,
  dummyNewUserData
];

export const dummyFollowersData = [dummyUser2Data, dummyUser4Data]
export const dummyFollowingData = [dummyUser5Data]
export const dummyPendingConnectionsData = [dummyUser3Data]

// ==========================================
// ✅ SOCIAL MEDIA STORIES & POSTS FEEDS
// ==========================================
export const dummyStoriesData = [
  { _id: "s1", user: dummyUserData, content: "Morning vibes!", media_url: "", media_type: "text", background_color: "#4f46e5" },
  { _id: "s2", user: dummyUser2Data, media_url: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg", media_type: "image" },
  { _id: "s3", user: dummyUser3Data, content: "Coffee time!", media_url: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg", media_type: "image" },
  { _id: "s4", user: dummyUser4Data, content: "Working on React!", media_type: "text", background_color: "#ec4899" },
  { _id: "s5", user: dummyUser5Data, media_url: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg", media_type: "image" },
  { _id: "s6", user: dummyUser6Data, content: "Late night coding", media_type: "text", background_color: "#10b981" },
  { _id: "s7", user: dummyUser7Data, content: "Keep pushing!", media_type: "text", background_color: "#f59e0b" },
  { _id: "s8", user: dummyUser2Data, media_url: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg", media_type: "image" },
]

export const dummyPostsData = [
  { _id: "post_1", user: dummyUserData, content: "Authentication flow done 💻🔥", image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg", likes: ["user_1", "user_2"], likedByMe: true, comments: 12, createdAt: "2025-07-26T10:00:00.000Z" },
  { _id: "post_2", user: dummyUser2Data, content: "Need ergonomic chair 😅", image: "", likes: ["user_3"], likedByMe: false, comments: 8, createdAt: "2025-07-26T11:30:00.000Z" },
  { _id: "post_3", user: dummyUser3Data, content: "Beautiful sunset 🌅", image: "https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg", likes: ["user_1", "user_4", "user_5"], likedByMe: true, comments: 3, createdAt: "2025-07-27T18:45:00.000Z" },
  { _id: "post_4", user: dummyUser4Data, content: "Debugging 😎", image: "", likes: [], likedByMe: false, comments: 9, createdAt: "2025-07-28T09:00:00.000Z" },
  { _id: "post_5", user: dummyUser5Data, content: "Design 🎨", image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg", likes: ["user_2"], likedByMe: false, comments: 32, createdAt: "2025-07-28T14:00:00.000Z" },
  { _id: "post_6", user: dummyUser6Data, content: "New tech 🚀", image: "", likes: [], likedByMe: false, comments: 6, createdAt: "2025-07-29T08:00:00.000Z" },
  { _id: "post_7", user: dummyUser7Data, content: "Keep going 💪", image: "", likes: ["user_6", "user_7"], likedByMe: false, comments: 14, createdAt: "2025-07-29T16:00:00.000Z" },
]

// ========================================================
// ✅ DUMMY MESSAGES (Shaped exactly for RecentMsg mapping)
// ========================================================
export const dummyMessagesData = [
  {
    _id: "recent_1",
    lastMessage: "Game changer! Catch you later.",
    unreadCount: 0,
    updatedAt: "2026-05-19T10:30:00.000Z",
    from_user_id: dummyUser2Data
  },
  {
    _id: "recent_2",
    lastMessage: "Oh wow, just updated it. Looks incredible. Thanks!",
    unreadCount: 3,
    updatedAt: "2026-05-19T09:45:00.000Z",
    from_user_id: dummyUser3Data
  },
  {
    _id: "recent_3",
    lastMessage: "Let me know what you think when you compile it.",
    unreadCount: 0,
    updatedAt: "2026-05-18T14:15:00.000Z",
    from_user_id: dummyUser4Data
  },
  {
    _id: "recent_4",
    lastMessage: "Love your latest post! 🎨",
    unreadCount: 0,
    updatedAt: "2026-05-17T22:30:00.000Z",
    from_user_id: dummyUser5Data
  },
  {
    _id: "recent_5",
    lastMessage: "It compiles down to native assembly. Super fast.",
    unreadCount: 1,
    updatedAt: "2026-05-17T11:20:00.000Z",
    from_user_id: dummyUser6Data
  },
  {
    _id: "recent_6",
    lastMessage: "Meeting at 3pm?",
    unreadCount: 0,
    updatedAt: "2026-05-16T15:00:00.000Z",
    from_user_id: dummyUser7Data
  },
  {
    _id: "recent_7",
    lastMessage: "Hey there! Just joined the platform community space 🎉",
    unreadCount: 0,
    updatedAt: "2026-05-15T10:00:00.000Z",
    from_user_id: dummyNewUserData
  }
];

// =============================================================
// ✅ CHAT HISTORY (Deep text feeds inside individual chat windows)
// =============================================================
export const dummyChatHistoryData = {
  user_2: [
    { _id: "msg_2_1", senderId: "other", text: "Hey Richard here! How's the project setup going?", timestamp: "10:00 AM" },
    { _id: "msg_2_2", senderId: "me", text: "Almost done! Just configuring the layout grids and routes.", timestamp: "10:15 AM" },
    { _id: "msg_2_3", senderId: "other", text: "Awesome. Let me know if you run into any compression or hosting issues!", timestamp: "10:16 AM" },
    { _id: "msg_2_4", senderId: "me", text: "Will do. Thanks, man!", timestamp: "10:20 AM" },
    { _id: "msg_2_5", senderId: "other", text: "Game changer! Catch you later.", timestamp: "10:30 AM" },
  ],
  user_3: [
    { _id: "msg_3_1", senderId: "other", text: "Hi John, can you help me look over the new Figma frames?", timestamp: "03:00 PM" },
    { _id: "msg_3_2", senderId: "me", text: "Sure, what's up? Are the color weights looking off?", timestamp: "03:20 PM" },
    { _id: "msg_3_3", senderId: "other", text: "Yeah, the contrast ratio on the message cards feels a bit low.", timestamp: "03:22 PM" },
    { _id: "msg_3_4", senderId: "me", text: "Let's change them to a pink-500 accent for active views. That'll pop!", timestamp: "03:25 PM" },
    { _id: "msg_3_5", senderId: "other", text: "Oh wow, just updated it. Looks incredible. Thanks!", timestamp: "03:45 PM" },
  ],
  user_4: [
    { _id: "msg_4_1", senderId: "other", text: "Did you see the new update repository?", timestamp: "09:00 AM" },
    { _id: "msg_4_2", senderId: "me", text: "Not yet, what changed in this version?", timestamp: "09:10 AM" },
    { _id: "msg_4_3", senderId: "other", text: "Major UI performance improvements! Everything loads instantly.", timestamp: "09:12 AM" },
    { _id: "msg_4_4", senderId: "other", text: "And dark mode hooks are finally supported natively.", timestamp: "09:13 AM" },
    { _id: "msg_4_5", senderId: "me", text: "Sweet, I'm going to pull down the master branch and check it out now.", timestamp: "09:14 AM" },
    { _id: "msg_4_6", senderId: "other", text: "Let me know what you think when you compile it.", timestamp: "09:15 AM" },
  ],
  user_5: [
    { _id: "msg_5_1", senderId: "other", text: "Love your latest post! The animation curve is flawless 🎨", timestamp: "Yesterday" },
    { _id: "msg_5_2", senderId: "me", text: "Thanks Sarah! Spent way too much time adjusting the cubic-bezier coordinates haha.", timestamp: "Yesterday" },
    { _id: "msg_5_3", senderId: "other", text: "It paid off! Are you free for a design sync next Tuesday?", timestamp: "Yesterday" },
    { _id: "msg_5_4", senderId: "me", text: "Definitely. Put it on my calendar!", timestamp: "Yesterday" },
  ],
  user_6: [
    { _id: "msg_6_1", senderId: "other", text: "Check out this new full-stack framework I found.", timestamp: "2 Days Ago" },
    { _id: "msg_6_2", senderId: "other", text: "It compiles down to native assembly. Super fast.", timestamp: "2 Days Ago" },
    { _id: "msg_6_3", senderId: "me", text: "Interesting. Does it support dynamic client-side hydration out of the box?", timestamp: "2 Days Ago" },
    { _id: "msg_6_4", senderId: "other", text: "Yes! You should absolutely try it for your next project build.", timestamp: "2 Days Ago" },
  ],
  user_7: [
    { _id: "msg_7_1", senderId: "other", text: "Hey, are we still meeting up today for the review?", timestamp: "3 Days Ago" },
    { _id: "msg_7_2", senderId: "me", text: "Yes, 3pm works perfectly for me. See you at the main workspace.", timestamp: "3 Days Ago" },
    { _id: "msg_7_3", senderId: "other", text: "Perfect, I will bring the printed outline parameters.", timestamp: "3 Days Ago" },
    { _id: "msg_7_4", senderId: "me", text: "Awesome, see you there!", timestamp: "3 Days Ago" },
    { _id: "msg_7_5", senderId: "other", text: "Meeting at 3pm?", timestamp: "3 Days Ago" },
  ],
  user_8: [
    { _id: "msg_8_1", senderId: "other", text: "Hey there! Just joined the platform community space 🎉", timestamp: "4 Days Ago" },
    { _id: "msg_8_2", senderId: "me", text: "Welcome aboard! Let me know if you need help navigating around the modules.", timestamp: "4 Days Ago" },
    { _id: "msg_8_3", senderId: "other", text: "Thanks! The feed stream and messaging systems are running super smooth.", timestamp: "4 Days Ago" },
  ],
};