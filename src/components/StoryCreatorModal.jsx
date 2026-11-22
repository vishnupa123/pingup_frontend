import React, { useState } from 'react';
import axios from 'axios';
import { X, Type, ImagePlus, Send, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL, authHeaders } from '../lib/api';

const BG_COLORS = ['#4F46E5', '#EC4899', '#0EA5E9', '#10B981', '#F59E0B', '#111827'];

const StoryCreatorModal = ({ onClose, onCreated }) => {
  const [step, setStep] = useState('choose'); // choose | text | media
  const [text, setText] = useState('');
  const [background, setBackground] = useState(BG_COLORS[0]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const resetMedia = () => {
    setFile(null);
    setPreview('');
  };

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith('image/') && !selected.type.startsWith('video/')) {
      toast.error('Please select an image or video file.');
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async () => {
    if (step === 'text' && !text.trim()) {
      toast.error('Write something for your story.');
      return;
    }
    if (step === 'media' && !file) {
      toast.error('Select an image or video.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (step === 'media') {
        formData.append('media', file);
      } else {
        formData.append('content', text.trim());
        formData.append('background', background);
      }

      await axios.post(`${API_URL}/api/stories/create`, formData, { headers: { ...authHeaders() } });
      toast.success('Story posted!');
      onCreated?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post story.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {step !== 'choose' && (
              <button onClick={() => { setStep('choose'); resetMedia(); }} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600">
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-slate-800">Add Story</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {step === 'choose' && (
            <div>
              <p className="text-sm text-slate-500 mb-4">Choose what you want to share. Your story will be visible to people who follow you.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setStep('text')}
                  className="group border border-slate-200 rounded-xl p-5 text-left hover:border-indigo-400 hover:bg-indigo-50/40 transition"
                >
                  <div className="w-11 h-11 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                    <Type size={22} />
                  </div>
                  <h3 className="font-semibold text-slate-800">Text Story</h3>
                  <p className="text-xs text-slate-500 mt-1">Write a short message with a background color.</p>
                </button>

                <button
                  onClick={() => setStep('media')}
                  className="group border border-slate-200 rounded-xl p-5 text-left hover:border-pink-400 hover:bg-pink-50/40 transition"
                >
                  <div className="w-11 h-11 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center mb-3">
                    <ImagePlus size={22} />
                  </div>
                  <h3 className="font-semibold text-slate-800">Image / Video</h3>
                  <p className="text-xs text-slate-500 mt-1">Upload a photo or a video (up to 30 seconds).</p>
                </button>
              </div>
            </div>
          )}

          {step === 'text' && (
            <div className="space-y-4">
              <div className="rounded-xl p-6 min-h-[220px] flex items-center justify-center" style={{ background }}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write your story..."
                  className="w-full bg-transparent text-white text-xl font-semibold text-center placeholder:text-white/70 outline-none resize-none min-h-[140px]"
                  maxLength={300}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Background</p>
                <div className="flex gap-2 flex-wrap">
                  {BG_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackground(color)}
                      className={`w-8 h-8 rounded-full border-2 ${background === color ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Send size={16} /> {loading ? 'Posting...' : 'Post Story'}
              </button>
            </div>
          )}

          {step === 'media' && (
            <div className="space-y-4">
              <label className="block border-2 border-dashed border-slate-200 rounded-xl p-4 min-h-[220px] flex items-center justify-center cursor-pointer hover:border-pink-300 hover:bg-pink-50/20 transition overflow-hidden">
                {preview ? (
                  file?.type.startsWith('video/') ? (
                    <video src={preview} controls className="max-h-[260px] rounded-lg" />
                  ) : (
                    <img src={preview} alt="Preview" className="max-h-[260px] rounded-lg object-contain" />
                  )
                ) : (
                  <div className="text-center">
                    <ImagePlus className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">Click to upload image or video</p>
                    <p className="text-xs text-slate-400 mt-1">Video should be 30 seconds or less</p>
                  </div>
                )}
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
              </label>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-pink-600 text-white font-medium hover:bg-pink-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Send size={16} /> {loading ? 'Posting...' : 'Post Story'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryCreatorModal;
