import React, { useState } from 'react';
import { Send } from 'lucide-react';
import axios from 'axios';

const CmtBx = ({ comments, setComments, postId }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendComment = async () => {
    // Check if postId exists before calling API
    if (!text.trim() || !postId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8000/api/posts/${postId}/comments`, 
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, response.data]);
      setText('');
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to post comment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 space-y-3 touch-pan-y">
        {comments && comments.length > 0 ? (
          comments.map((cmt) => (
            <div key={cmt._id} className="flex gap-2 items-start">
              <img src={cmt.userId?.profilePic || 'https://ui-avatars.com/api/?name=User'} className="w-8 h-8 rounded-full flex-shrink-0" alt="avatar" />
              <div className="bg-gray-50 p-2.5 rounded-lg text-sm w-full min-w-0">
                <p className="font-bold text-[11px] text-gray-800">{cmt.userId?.fullName || 'User'}</p>
                <p className="text-[12px] text-gray-700 break-words">{cmt.text}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center mt-8">No comments yet.</p>
        )}
      </div>

      <div className="px-3 py-3 sm:px-4 sm:py-4 border-t border-gray-100 bg-white shrink-0 flex items-center gap-2">
        <input 
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
          type="text" 
          placeholder="Add a comment..." 
          className="w-full text-sm p-2.5 sm:p-3 border border-gray-200 rounded-full outline-none focus:border-blue-500"
        />
        <button onClick={handleSendComment} disabled={loading} className="p-2.5 sm:p-3 bg-blue-600 text-white rounded-full disabled:opacity-70 flex-shrink-0">
          {loading ? "..." : <Send size={16} />}
        </button>
      </div>
    </div>
  );
};

export default CmtBx;