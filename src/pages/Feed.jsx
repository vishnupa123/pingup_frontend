import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { assets } from '../assets/assets';
import Loading from '../components/Loading';
import Postscard from '../components/Postscard';
import RecentMsg from '../components/RecentMsg';
import StoriesRow from '../components/StoriesRow';
import { useNotifications } from '../context/NotificationContext';
import { API_URL } from '../lib/api';

const PAGE_SIZE = 10;

const fetchFeedPage = async ({ pageParam = 1 }) => {
  const token = localStorage.getItem('token');
  const { data } = await axios.get(`${API_URL}/api/posts/`, {
    params: { page: pageParam, limit: PAGE_SIZE },
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });

  // Backward-compatible handling
  if (Array.isArray(data)) {
    return { posts: data, hasMore: false, nextPage: null };
  }
  return {
    posts: Array.isArray(data?.posts) ? data.posts : [],
    hasMore: Boolean(data?.hasMore),
    nextPage: data?.nextPage ?? null,
  };
};

const Feed = () => {
  const queryClient = useQueryClient();
  const sentinelRef = useRef(null);
  const { markAppReadByType } = useNotifications();

  useEffect(() => {
    markAppReadByType('post');
  }, [markAppReadByType]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: fetchFeedPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
  });

  const feed = data?.pages.flatMap((page) => page.posts) ?? [];

  useEffect(() => {
    const onPostCreated = () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    };
    window.addEventListener('post-created', onPostCreated);
    return () => window.removeEventListener('post-created', onPostCreated);
  }, [queryClient]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, feed.length]);

  const handleDelete = (deletedId) => {
    queryClient.setQueryData(['feed'], (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts.filter((item) => item._id !== deletedId),
        })),
      };
    });
  };

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-[1400px] mx-auto sm:px-10 py-4 flex flex-col lg:flex-row gap-8 justify-between items-start">
      <div className="flex-1 w-full lg:max-w-[850px]">
        <div className="px-4 pt-2 pb-1 sm:hidden flex justify-end">
          <img src={assets.logo} alt="PingUp" className="w-28" />
        </div>
        <div className="mt-2 mb-6">
          <StoriesRow />
        </div>

        {isError && (
          <div className="text-center text-sm text-red-500 py-6">Failed to load feed. Please try again.</div>
        )}

        <div className="flex flex-col gap-8">
          {feed.map((post) => (
            <Postscard
              key={post._id}
              feed={post}
              initialComments={post.comments || []}
              fetchFeed={() => refetch()}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <div ref={sentinelRef} className="h-10 flex items-center justify-center">
          {isFetchingNextPage && <span className="text-sm text-gray-400">Loading more posts...</span>}
          {!hasNextPage && feed.length > 0 && <span className="text-xs text-gray-400">No more posts</span>}
        </div>
      </div>

      <aside className="hidden lg:flex flex-col gap-8 w-full lg:max-w-[350px] shrink-0 sticky top-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sponsored</span>
            <span className="text-xs text-blue-500 font-medium cursor-pointer hover:underline">Create Ad</span>
          </div>
          <div className="rounded-sm overflow-hidden border border-gray-100 shadow-sm mb-4">
            <a href="https://www.flipkart.com/" target="_blank" rel="noopener noreferrer">
              <img
                src='https://images.livemint.com/img/2022/09/24/600x338/flipkart_big_billion_days_1663073829131_1664014900248_1664014900248.png'
                alt="Sponsored Ad"
                className="w-full h-auto object-cover max-h-[180px] hover:scale-102 transition-transform duration-300"
              />
            </a>
          </div>
          <div className="flex flex-col gap-1.5">
            <h4 className="text-sm font-bold text-gray-800 leading-snug">Unleash Premium Performance</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Elevate your development workflow with the absolute state-of-the-art ergonomic keyboard and workspace setup. Designed for creators.</p>
            <a href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsQwBpF7EgDZpuxCK-9sPrjddcrp0EGnXTlA&s" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 font-semibold hover:underline mt-1 block">www.flipkart.com</a>
          </div>
        </div>
        <div className="w-full">
          <RecentMsg />
        </div>
      </aside>
    </div>
  );
};

export default Feed;
