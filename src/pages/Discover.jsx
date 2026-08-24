import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import UserCard from '../components/UserCard';
import axios from 'axios';

const Discover = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Initial Load
  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [usersRes, meRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/users/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data);
      setCurrentUser(meRes.data.user);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Search API Call
  const handleSearch = async (query) => {
    if (!query) {
      fetchInitialData(); // 
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/search?query=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery);
      else fetchInitialData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className='max-w-5xl w-full p-6'>
      <h1 className='text-2xl font-semibold text-blue-600 mb-6'>Discover</h1>
      <div className='relative mb-6'>
        <Search className='absolute left-3 top-3 text-gray-400' size={18} />
        <input
          type='text'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search by name or username...'
          className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {loading ? (
          <p className='text-gray-500'>Loading...</p>
        ) : (
          users
            .filter((u) => u._id !== currentUser?._id) // 
            .map((user) => (
              <UserCard user={user} key={user._id} currentUser={currentUser} />
            ))
        )}
      </div>
    </div>
  );
};

export default Discover;