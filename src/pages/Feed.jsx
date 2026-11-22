import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { assets } from '../assets/assets';
import Loading from '../components/Loading';
import Postscard from '../components/Postscard';
import RecentMsg from '../components/RecentMsg';
import StoriesRow from '../components/StoriesRow';
import { API_URL } from '../lib/api';

const Feed = () => {
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch feed posts from backend
  const fetchFeed = async () => {
    const token = localStorage.getItem('token'); 
    
    setIsLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/posts/`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });

      let posts = response.data;
      if (!Array.isArray(posts)) {
        if (posts && Array.isArray(posts.posts)) posts = posts.posts;
        else if (posts && Array.isArray(posts.data)) posts = posts.data;
        else if (posts && Array.isArray(posts.results)) posts = posts.results;
        else posts = Array.isArray(response.data) ? response.data : [];
      }

      setFeed(posts || []);
    } catch (error) {
      console.error("❌ Error fetching feed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Set empty feed to prevent infinite loading
      setFeed([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const onPostCreated = () => fetchFeed();
    window.addEventListener('post-created', onPostCreated);
    return () => window.removeEventListener('post-created', onPostCreated);
  }, []);

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
        <div className="flex flex-col gap-8">
          {feed.map((post) => (
            <Postscard
              key={post._id}
              feed={post}
              // We pass the existing comments from the API response into the card
              initialComments={post.comments || []}
              fetchFeed={fetchFeed}
              onDelete={(deletedId) => setFeed((prevFeed) => prevFeed.filter((item) => item._id !== deletedId))}
            />
          ))}
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