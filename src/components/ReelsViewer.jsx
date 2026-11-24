import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Download, Heart, MessageCircle, Play, Volume2, VolumeX, X } from 'lucide-react';
import axios from 'axios';
import CmtBx from './CmtBx';
import { API_URL, authHeaders, getCurrentUser } from '../lib/api';
import { downloadVideo } from '../lib/download';

const getLikedMap = () => {
  try {
    return JSON.parse(localStorage.getItem('likedPosts') || '{}');
  } catch {
    return {};
  }
};

const getLikeCount = (post) =>
  typeof post?.likeCount === 'number'
    ? post.likeCount
    : Array.isArray(post?.likes)
      ? post.likes.length
      : 0;

const getComments = (post) => (Array.isArray(post?.comments) ? post.comments : []);

const getAuthorId = (post) =>
  typeof post?.author === 'object' ? post?.author?._id : post?.author;

const isLiked = (post, myId) => {
  if (typeof post?.isLiked === 'boolean') return post.isLiked;
  if (typeof post?.likedByMe === 'boolean') return post.likedByMe;
  if (myId && Array.isArray(post?.likes)) {
    return post.likes.some((id) => String(id) === String(myId));
  }
  return Boolean(getLikedMap()[post?._id]);
};

const ReelsViewer = ({ videos, initialIndex, onClose, onUpdateVideo }) => {
  const navigate = useNavigate();
  const me = getCurrentUser();
  const myId = me?.id || me?._id;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [pausedIndex, setPausedIndex] = useState(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [heartBurstKey, setHeartBurstKey] = useState(0);
  const [muted, setMuted] = useState(true);
  const [commentsPostId, setCommentsPostId] = useState(null);
  const [drawerComments, setDrawerComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const currentIndexRef = useRef(initialIndex);
  const tapTimerRef = useRef(null);
  const lastTapRef = useRef(0);
  const heartTimerRef = useRef(null);
  const drawerCommentsRef = useRef([]);

  const activeVideo = videos[currentIndex];

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (heartTimerRef.current) clearTimeout(heartTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (container) container.scrollTop = initialIndex * container.clientHeight;
      const video = videoRefs.current[initialIndex];
      if (video) video.currentTime = 0;
    });
    return () => cancelAnimationFrame(frame);
  }, [initialIndex]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      video.muted = muted;

      if (index === currentIndex && pausedIndex !== currentIndex && !commentsPostId) {
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') promise.catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentIndex, pausedIndex, commentsPostId, muted, videos.length]);

  const scrollToIndex = (index) => {
    const container = containerRef.current;
    if (!container) return;
    const next = Math.max(0, Math.min(videos.length - 1, index));
    container.scrollTo({ top: next * container.clientHeight, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || !container.clientHeight) return;

    const next = Math.max(
      0,
      Math.min(videos.length - 1, Math.round(container.scrollTop / container.clientHeight))
    );

    if (next !== currentIndexRef.current) {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      lastTapRef.current = 0;
      currentIndexRef.current = next;
      setCurrentIndex(next);
      setPausedIndex(null);
      setShowScrollHint(false);
      setHeartBurstKey(0);
    }
  };

  function togglePause() {
    setPausedIndex((prev) => (prev === currentIndexRef.current ? null : currentIndexRef.current));
    setShowScrollHint(false);
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (commentsPostId) closeComments();
        else onClose();
        return;
      }
      if (commentsPostId) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        scrollToIndex(currentIndexRef.current + 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        scrollToIndex(currentIndexRef.current - 1);
      } else if (event.key === ' ') {
        event.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, commentsPostId, videos.length]);

  const persistLike = (postId, liked) => {
    const map = getLikedMap();
    map[postId] = liked;
    localStorage.setItem('likedPosts', JSON.stringify(map));
  };

  const applyLike = (postId, liked, count) => {
    onUpdateVideo(postId, (post) => ({ ...post, isLiked: liked, likeCount: count }));
  };

  const toggleLike = (post) => {
    if (!post) return;

    const wasLiked = isLiked(post, myId);
    const previousCount = getLikeCount(post);
    const nextLiked = !wasLiked;
    const nextCount = Math.max(0, previousCount + (nextLiked ? 1 : -1));

    applyLike(post._id, nextLiked, nextCount);
    persistLike(post._id, nextLiked);

    axios
      .post(`${API_URL}/api/posts/${post._id}/like`, {}, { headers: authHeaders() })
      .catch((error) => {
        console.error('Error liking video:', error);
        applyLike(post._id, wasLiked, previousCount);
        persistLike(post._id, wasLiked);
      });
  };

  const showHeart = () => {
    setHeartBurstKey((key) => key + 1);
    if (heartTimerRef.current) clearTimeout(heartTimerRef.current);
    heartTimerRef.current = setTimeout(() => setHeartBurstKey(0), 750);
  };

  const doubleTapLike = (post) => {
    showHeart();
    if (post && !isLiked(post, myId)) toggleLike(post);
  };

  const handleVideoTap = (event) => {
    event.preventDefault();
    const now = Date.now();

    if (now - lastTapRef.current < 300) {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      lastTapRef.current = 0;
      doubleTapLike(activeVideo);
      return;
    }

    lastTapRef.current = now;
    tapTimerRef.current = setTimeout(() => {
      togglePause();
    }, 280);
  };

  const syncDrawerComments = (nextOrUpdater) => {
    const next =
      typeof nextOrUpdater === 'function'
        ? nextOrUpdater(drawerCommentsRef.current)
        : nextOrUpdater;

    drawerCommentsRef.current = next;
    setDrawerComments(next);
    if (commentsPostId) {
      onUpdateVideo(commentsPostId, (post) => ({ ...post, comments: next }));
    }
  };

  const openComments = async (post) => {
    if (!post) return;

    const initial = getComments(post);
    drawerCommentsRef.current = initial;
    setDrawerComments(initial);
    setCommentsPostId(post._id);
    setCommentsLoading(true);

    try {
      const { data } = await axios.get(`${API_URL}/api/posts/${post._id}/comments`, {
        headers: authHeaders(),
      });
      const list = Array.isArray(data) ? data : data?.comments || [];
      drawerCommentsRef.current = list;
      setDrawerComments(list);
      onUpdateVideo(post._id, (item) => ({ ...item, comments: list }));
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  function closeComments() {
    setCommentsPostId(null);
    setCommentsLoading(false);
  }

  const goToProfile = (post) => {
    const authorId = getAuthorId(post);
    if (!authorId) return;
    if (myId && String(authorId) === String(myId)) navigate('/profile');
    else navigate(`/profile/${authorId}`);
    onClose();
  };

  if (!activeVideo) return null;

  return (
    <div className='fixed inset-0 z-[100] bg-black'>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className='h-full w-full overflow-x-hidden overflow-y-scroll snap-y snap-mandatory overscroll-contain no-scrollbar'
      >
        {videos.map((video, index) => {
          const liked = isLiked(video, myId);
          const comments = getComments(video);

          return (
            <div key={video._id} className='h-[100dvh] w-full snap-start flex items-center justify-center'>
              <div className='relative h-[100dvh] w-full max-w-[440px] overflow-hidden bg-black'>
                <video
                  ref={(element) => { videoRefs.current[index] = element; }}
                  src={video.videoUrl}
                  muted={muted}
                  playsInline
                  preload={index === initialIndex ? 'auto' : 'metadata'}
                  className='pointer-events-none h-full w-full object-contain bg-black'
                  onEnded={() => {
                    if (index !== currentIndexRef.current) return;
                    setShowScrollHint(true);
                    setPausedIndex(index);
                  }}
                />

                <button
                  type='button'
                  onClick={handleVideoTap}
                  className='absolute inset-0 z-10 cursor-pointer touch-manipulation select-none'
                  aria-label={pausedIndex === index ? 'Play video' : 'Pause video'}
                />

                <div className='pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-black/60 to-transparent' />
                <div className='pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-black/75 to-transparent' />

                <div className='absolute right-3 top-4 z-30 flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => setMuted((value) => !value)}
                    className='flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm cursor-pointer'
                    aria-label={muted ? 'Unmute' : 'Mute'}
                  >
                    {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <button
                    type='button'
                    onClick={onClose}
                    className='flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm cursor-pointer'
                    aria-label='Close video'
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Right-side Instagram-style actions */}
                <div className='absolute right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-1'>
                  <button
                    type='button'
                    onClick={() => toggleLike(video)}
                    className='flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 cursor-pointer'
                    aria-label={liked ? 'Unlike' : 'Like'}
                  >
                    <Heart size={28} className={liked ? 'fill-red-500 text-red-500' : 'text-white'} />
                  </button>
                  <span className='text-xs font-semibold text-white drop-shadow'>{getLikeCount(video)}</span>

                  <button
                    type='button'
                    onClick={() => openComments(video)}
                    className='mt-4 flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 cursor-pointer'
                    aria-label='Open comments'
                  >
                    <MessageCircle size={28} className='text-white' />
                  </button>
                  <span className='text-xs font-semibold text-white drop-shadow'>{comments.length}</span>

                  <button
                    type='button'
                    onClick={() => downloadVideo(video.videoUrl, `pingup-reel-${video._id}.mp4`)}
                    className='mt-4 flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 cursor-pointer'
                    aria-label='Download video'
                    title='Download video'
                  >
                    <Download size={26} className='text-white' />
                  </button>
                </div>

                {/* Video info */}
                <div className='absolute bottom-5 left-4 right-20 z-30 flex items-end gap-3 text-white'>
                  <button
                    type='button'
                    onClick={() => goToProfile(video)}
                    className='shrink-0 cursor-pointer'
                    aria-label={`Open ${video.author?.fullName || 'user'} profile`}
                  >
                    <img
                      src={video.author?.profilePic || 'https://ui-avatars.com/api/?name=User'}
                      alt='author'
                      className='h-9 w-9 rounded-full border-2 border-white object-cover shadow-md'
                      onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=User'; }}
                    />
                  </button>
                  <div className='min-w-0 pb-0.5'>
                    <p className='text-sm font-semibold drop-shadow'>
                      @{video.author?.username || 'user'}
                    </p>
                    {video.content && (
                      <p className='text-xs leading-snug text-white/90 drop-shadow line-clamp-2'>
                        {video.content}
                      </p>
                    )}
                  </div>
                </div>

                {pausedIndex === index && !commentsPostId && !showScrollHint && (
                  <div className='pointer-events-none absolute inset-0 z-30 flex items-center justify-center'>
                    <Play size={64} className='fill-white/80 text-white/80 drop-shadow-lg' />
                  </div>
                )}

                {heartBurstKey > 0 && index === currentIndex && (
                  <div className='pointer-events-none absolute inset-0 z-40 flex items-center justify-center'>
                    <Heart key={heartBurstKey} size={96} className='animate-heart-pop fill-white text-white drop-shadow-lg' />
                  </div>
                )}

                {showScrollHint && index === currentIndex && (
                  <div className='pointer-events-none absolute bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/55 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm'>
                    <ChevronDown size={16} />
                    Scroll for more
                  </div>
                )}

                {/* Comments drawer */}
                {commentsPostId === video._id && (
                  <div className='absolute inset-0 z-50 flex items-end'>
                    <button
                      type='button'
                      onClick={closeComments}
                      className='absolute inset-0 cursor-default bg-black/55'
                      aria-label='Close comments'
                    />
                    <div className='relative z-10 h-[72%] w-full overflow-hidden rounded-t-2xl bg-white'>
                      <div className='flex items-center justify-between border-b border-gray-100 px-4 py-3'>
                        <h3 className='text-sm font-semibold text-gray-800'>Comments</h3>
                        <button
                          type='button'
                          onClick={closeComments}
                          className='p-1 text-gray-500 hover:text-gray-800 cursor-pointer'
                          aria-label='Close comments'
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className='h-[calc(100%-49px)]'>
                        {commentsLoading && (
                          <p className='absolute left-1/2 top-16 z-10 -translate-x-1/2 text-xs text-gray-400'>
                            Loading comments...
                          </p>
                        )}
                        <CmtBx
                          comments={drawerComments}
                          setComments={syncDrawerComments}
                          postId={commentsPostId}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReelsViewer;
