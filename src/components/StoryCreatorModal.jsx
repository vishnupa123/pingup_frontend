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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {step !== 'choose' && (
              <button onClick={() => { setStep('choose'); resetMedia(); }} className="p-1 rounded-md hover:bg-slate-100 text-slate-600">
                <ArrowLeft size={16} />
              </button>
            )}
            <h2 className="text-sm font-semibold text-slate-800">Add Story</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 text-slate-500">
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          {step === 'choose' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep('text')}
                className="flex flex-col items-center justify-center gap-2 border border-slate-200 rounded-lg py-5 hover:bg-slate-50 transition"
              >
                <Type size={22} className="text-indigo-600" />
                <span className="text-sm font-medium text-slate-700">Text</span>
              </button>
              <button
                onClick={() => setStep('media')}
                className="flex flex-col items-center justify-center gap-2 border border-slate-200 rounded-lg py-5 hover:bg-slate-50 transition"
              >
                <ImagePlus size={22} className="text-pink-600" />
                <span className="text-sm font-medium text-slate-700">Media</span>
              </button>
            </div>
          )}

          {step === 'text' && (
            <div className="space-y-3">
              <div className="rounded-lg p-4 min-h-[160px] flex items-center justify-center" style={{ background }}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write..."
                  className="w-full bg-transparent text-white text-lg font-semibold text-center placeholder:text-white/70 outline-none resize-none min-h-[100px]"
                  maxLength={300}
                />
              </div>
              <div className="flex gap-2 justify-center">
                {BG_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackground(color)}
                    className={`w-6 h-6 rounded-full border-2 ${background === color ? 'border-slate-800' : 'border-transparent'}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Send size={14} /> {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          )}

          {step === 'media' && (
            <div className="space-y-3">
              <label className="block border border-dashed border-slate-300 rounded-lg p-3 min-h-[160px] flex items-center justify-center cursor-pointer hover:bg-slate-50 transition overflow-hidden">
                {preview ? (
                  file?.type.startsWith('video/') ? (
                    <video src={preview} controls className="max-h-[200px] rounded-md" />
                  ) : (
                    <img src={preview} alt="Preview" className="max-h-[200px] rounded-md object-contain" />
                  )
                ) : (
                  <ImagePlus className="w-8 h-8 text-slate-400" />
                )}
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
              </label>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2 rounded-lg bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Send size={14} /> {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryCreatorModal;
