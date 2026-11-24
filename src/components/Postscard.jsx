import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Trash2, Edit2, Heart, MessageCircle, Play, Download } from 'lucide-react';
import axios from 'axios';
import moment from 'moment';
import DeletePop from './DeletePop';
import CmtBx from './CmtBx';
import { API_URL } from '../lib/api';
import { downloadVideo } from '../lib/download';

// Shared across all feed posts so starting one video pauses the previous one.
const feedVideos = new Set();

const pauseOtherFeedVideos = (currentVideo) => {
  feedVideos.forEach((video) => {
    if (video !== currentVideo && !video.paused) video.pause();
  });
};

const Postscard = ({ feed, fetchFeed, initialComments = [], currentUserId, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [showcmt, setShowcmt] = useState(false);

  const getStoredUserId = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return null;
      const parsedUser = JSON.parse(storedUser);
      return parsedUser?._id || parsedUser?.id || parsedUser?.userId || null;
    } catch {
      return null;
    }
  };

  const getPersistedLikedPosts = () => {
    try {
      const storedLikes = localStorage.getItem('likedPosts');
      return storedLikes ? JSON.parse(storedLikes) : {};
    } catch {
      return {};
    }
  };

  const resolvedUserId = currentUserId || getStoredUserId();

  // Use the API's like flag first. Only fall back to the likes array/local
  // storage when the API didn't send one, so other people's posts don't show
  // as "liked" just because of a stale localStorage entry.
  const isLikedByMe = (post, myId) => {
    if (typeof post?.isLiked === 'boolean') return post.isLiked;
    if (typeof post?.likedByMe === 'boolean') return post.likedByMe;
    if (myId && Array.isArray(post?.likes)) {
      return post.likes.some((id) => String(id) === String(myId));
    }
    return Boolean(getPersistedLikedPosts()[post?._id]);
  };

  const initialLikesCount = typeof feed.likeCount === 'number'
    ? feed.likeCount
    : Array.isArray(feed.likes)
      ? feed.likes.length
      : 0;

  // Local state to handle the like UI without reloading
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(() => isLikedByMe(feed, resolvedUserId));

  const [comments, setComments] = useState(initialComments);
  const [showHeart, setShowHeart] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);
  const menuRef = useRef(null);

  const registerVideo = (element) => {
    if (videoRef.current) feedVideos.delete(videoRef.current);
    videoRef.current = element;
    if (element) feedVideos.add(element);
  };
  const deleteTimerRef = useRef(null);
  const heartTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      if (heartTimerRef.current) clearTimeout(heartTimerRef.current);
      if (videoRef.current) {
        videoRef.current.pause();
        feedVideos.delete(videoRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showcmt) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showcmt]);

  useEffect(() => {
    setIsLiked(isLikedByMe(feed, resolvedUserId));
    setLikesCount(typeof feed.likeCount === 'number' ? feed.likeCount : Array.isArray(feed.likes) ? feed.likes.length : 0);
  }, [feed?._id, feed?.isLiked, feed?.likedByMe, feed?.likeCount, feed?.likes, resolvedUserId]);

  const handleDelete = async () => {
    setShowMenu(false);
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/posts/${feed._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteError(false);
      setShowDeleteSuccess(true);
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = setTimeout(() => setShowDeleteSuccess(false), 3000);
      if (onDelete) {
        onDelete(feed._id);
      } else if (fetchFeed) {
        fetchFeed();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setDeleteError(true);
      setShowDeleteSuccess(true);
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = setTimeout(() => setShowDeleteSuccess(false), 3000);
    }
  };

  const updateLike = async (nextLiked) => {
    const token = localStorage.getItem('token');

    const prevCount = likesCount;
    const prevLiked = isLiked;

    setLikesCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));
    setIsLiked(nextLiked);

    try {
      await axios.post(`${API_URL}/api/posts/${feed._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const persistedLikedPosts = getPersistedLikedPosts();
      persistedLikedPosts[feed._id] = nextLiked;
      localStorage.setItem('likedPosts', JSON.stringify(persistedLikedPosts));
    } catch (error) {
      console.error('Error liking post:', error);
      setLikesCount(prevCount);
      setIsLiked(prevLiked);
    }
  };

  // Heart button keeps the existing toggle behaviour.
  const addLike = () => updateLike(!isLiked);

  // Double-click on the photo only likes (never unlikes) and shows a heart pop.
  const handleDoubleClickLike = () => {
    setShowHeart(true);
    if (heartTimerRef.current) clearTimeout(heartTimerRef.current);
    heartTimerRef.current = setTimeout(() => setShowHeart(false), 750);

    if (!isLiked) updateLike(true);
  };

  const userData = feed.user || feed.author || {};
  const profilePic = userData.profilePic || userData.profile_picture || 'https://ui-avatars.com/api/?name=User';
  const fullName = userData.fullName || userData.full_name || 'User';
  const authorId = userData?._id || userData?.id || userData;

  // Only the post owner can see Edit/Delete.
  const getPostOwnerId = () => {
    const owner = feed?.user || feed?.author || feed?.postedBy || feed?.userId;
    if (owner && typeof owner === 'object') return owner._id || owner.id;
    return owner;
  };
  const postOwnerId = getPostOwnerId();
  const isOwner = Boolean(
    resolvedUserId && postOwnerId && String(resolvedUserId) === String(postOwnerId)
  );

  const goToProfile = () => {
    if (!authorId) return;
    if (resolvedUserId && String(authorId) === String(resolvedUserId)) navigate('/profile');
    else navigate(`/profile/${authorId}`);
  };

  const toggleVideoPlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      pauseOtherFeedVideos(video);
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    } else {
      video.pause();
    }
  };

  const imageMedia = [
    ...(Array.isArray(feed.images) ? feed.images : []),
    feed.image,
    feed.media_type === 'image' ? feed.media_url : null,
  ].filter(Boolean);

  const videoMedia = [
    feed.video,
    feed.media_type === 'video' ? feed.media_url : null,
  ].filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm w-full animate-card-enter">
      {showDeleteSuccess && (
        <DeletePop isError={deleteError} onClose={() => setShowDeleteSuccess(false)} />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={goToProfile}>
          <img
            src={profilePic}
            className="w-10 h-10 rounded-full object-cover border border-gray-100"
            alt="profile"
            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=User'; }}
          />
          <div>
            <div className="font-semibold text-sm text-gray-800 hover:underline">{fullName}</div>
            <div className="text-xs text-gray-400">{moment(feed.createdAt).fromNow()}</div>
          </div>
        </div>

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)} className="text-gray-500 hover:text-gray-700 cursor-pointer">
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1">
                <button className="w-full flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Edit2 size={16} /> Edit
                </button>
                <button onClick={handleDelete} className="w-full flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="my-6 text-gray-800 text-sm whitespace-pre-wrap">{feed.content}</div>

      {videoMedia.length > 0 && (
        <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-100 bg-black">
          <video
            ref={registerVideo}
            src={videoMedia[0]}
            playsInline
            preload="metadata"
            onPlay={(event) => {
              pauseOtherFeedVideos(event.currentTarget);
              setIsVideoPlaying(true);
            }}
            onPause={() => setIsVideoPlaying(false)}
            onEnded={() => setIsVideoPlaying(false)}
            className="w-full max-h-[500px] object-contain bg-black"
          />

          <button
            type="button"
            onClick={toggleVideoPlayback}
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center select-none"
            aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
          >
            {!isVideoPlaying && (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm">
                <Play size={26} className="ml-0.5 fill-white" />
              </span>
            )}
          </button>
        </div>
      )}

      {imageMedia.length > 0 && (
        <div className="relative mb-4">
          <div
            onDoubleClick={handleDoubleClickLike}
            className={`grid gap-2 select-none ${imageMedia.length === 1 ? 'grid-cols-1' : imageMedia.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
          >
            {imageMedia.map((src, index) => (
              <img key={index} src={src} alt={`Post media ${index + 1}`} className="w-full object-cover max-h-[400px] min-h-[300px] rounded-md" onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Image+not+available'; }} />
            ))}
          </div>

          {showHeart && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Heart className="animate-heart-pop text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]" size={90} fill="currentColor" strokeWidth={1} />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-6 ml-3">
        <button 
          onClick={addLike}
          className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'}`}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} /> {likesCount}
        </button>
        <button onClick={() => setShowcmt(true)} className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
          <MessageCircle size={20} /> {comments.length}
        </button>

        {videoMedia.length > 0 && (
          <button
            type="button"
            onClick={() => downloadVideo(videoMedia[0], `pingup-video-${feed._id}.mp4`)}
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-blue-500 cursor-pointer"
            aria-label="Download video"
            title="Download video"
          >
            <Download size={20} />
          </button>
        )}

        {showcmt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowcmt(false)}></div>
            <div className="relative w-full max-w-md max-h-[90vh] sm:max-h-[80vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 shrink-0">
                <h3 className="text-base font-semibold text-gray-800">Comments</h3>
                <button onClick={() => setShowcmt(false)} className="text-gray-500 hover:text-gray-700 font-bold text-lg leading-none">✕</button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <CmtBx postId={feed._id} comments={comments} setComments={setComments} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Postscard; 