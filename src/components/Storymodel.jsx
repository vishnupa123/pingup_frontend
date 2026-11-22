import { ArrowBigLeft, Image as ImageIcon, Type, Send, Palette, X } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL, authHeaders } from '../lib/api';

const Storymodel = ({ setmodelopen, fetchstorydata }) => {
  const bgcolors = [
    '#33FF57', '#FF5733', '#3357FF', '#F333FF', '#33FFF5', '#000000',
    '#FFC300', '#E91E63', '#9C27B0', '#00BCD4', '#FF5252', '#4CAF50',
    'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  ];

  const [mode, setmode] = useState('text');
  const [backround, setbackround] = useState(bgcolors[0]);
  const [text, settext] = useState('');
  const [media, setmedia] = useState(null);
  const [previewurl, setpreviewurl] = useState(null);
  const [sharing, setSharing] = useState(false);

  const handlemediaupload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setmedia(file);
      setpreviewurl(URL.createObjectURL(file));
      setmode('media');
    }
  };

  const removeMedia = () => {
    setmedia(null);
    setpreviewurl(null);
    setmode('text');
  };

  const handleShare = async () => {
    if (mode === 'text' && !text.trim()) {
      toast.error('Please write something for your story.');
      return;
    }
    if (mode === 'media' && !media) {
      toast.error('Please select an image or video.');
      return;
    }

    setSharing(true);
    try {
      const formData = new FormData();
      if (mode === 'media' && media) {
        formData.append('media', media);
      } else {
        formData.append('content', text.trim());
        formData.append('background', backround);
      }

      await axios.post(`${API_URL}/api/stories/create`, formData, {
        headers: { ...authHeaders() },
      });

      toast.success('Story shared!');
      fetchstorydata?.();
      setmodelopen(false);
    } catch (error) {
      console.error('Failed to share story:', error);
      toast.error(error.response?.data?.message || 'Failed to share story.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-xl p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/60">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/80">
          <button onClick={() => setmodelopen(false)} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
            <ArrowBigLeft className="w-6 h-6" />
          </button>
          <h2 className="text-gray-800 font-bold">Create Story</h2>

          <button
            onClick={handleShare}
            disabled={sharing}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-full font-medium flex items-center gap-2 transition shadow-lg shadow-blue-100"
          >
            <Send className="w-4 h-4" /> {sharing ? 'Sharing...' : 'Share'}
          </button>
        </div>

        {/* Story Canvas */}
        <div
          className="relative h-[500px] w-full flex items-center justify-center transition-all duration-500 bg-gray-100 overflow-hidden"
          style={{ background: mode === 'text' ? backround : '#1a1a1a' }}
        >
          {mode === 'text' ? (
            <div className="w-[85%] bg-white/20 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-xl">
              <textarea
                placeholder="What is on your mind?"
                className="w-full bg-transparent text-white text-center text-2xl font-black placeholder:text-white/70 focus:outline-none resize-none min-h-[140px]"
                onChange={(e) => settext(e.target.value)}
                value={text}
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {previewurl && (
                <>
                  <button
                    onClick={removeMedia}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {media?.type.startsWith('image/') ? (
                    <img src={previewurl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <video src={previewurl} controls className="w-full h-full object-cover" />
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-5 bg-white">
          <div className="flex items-center justify-center gap-12 mb-6">
            <button onClick={() => setmode('text')} className={`flex flex-col items-center gap-1 transition ${mode === 'text' ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
              <Type className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Text</span>
            </button>
            <label className={`flex flex-col items-center gap-1 cursor-pointer transition ${mode === 'media' ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
              <ImageIcon className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Media</span>
              <input type="file" hidden accept="image/*,video/*" onChange={handlemediaupload} />
            </label>
          </div>

          {mode === 'text' && (
            <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
              <Palette className="w-5 h-5 text-gray-500" />
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {bgcolors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setbackround(color)}
                    className={`w-9 h-9 rounded-full flex-shrink-0 border-2 transition-all ${backround === color ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Storymodel;
