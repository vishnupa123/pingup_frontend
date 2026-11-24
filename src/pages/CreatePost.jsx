import React, { useState } from 'react';
import axios from 'axios';
import { Image, X, Smile, MapPin } from 'lucide-react';
import Pops from '../components/Pops';
import Loading from '../components/Loading';
import { API_URL } from '../lib/api';

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); 
  const [imageFiles, setImageFiles] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // New state for popup

  const localUserStr = localStorage.getItem('user');
  const localUser = localUserStr ? JSON.parse(localUserStr) : null;
  const user = localUser || { fullName: "Guest User", username: "guest", profilePic: "" };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const MAX_FILE_SIZE = 50 * 1024 * 1024;
      const accepted = [];
      const previews = [];
      files.forEach((file) => {
        if (!(file.type.startsWith('image/') || file.type.startsWith('video/'))) {
          alert(`Skipped unsupported file type: ${file.name}`);
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          alert(`Skipped ${file.name}: file too large (max 50MB)`);
          return;
        }
        accepted.push(file);
        previews.push({ url: URL.createObjectURL(file), type: file.type });
      });
      if (accepted.length === 0) return;
      setImageFiles(prev => prev.concat(accepted));
      setImages(prev => prev.concat(previews));
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
    setImageFiles(imageFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let useFormData = imageFiles.length > 0;
    let payload = null;
    if (useFormData) {
      const formData = new FormData();
      formData.append("content", content);
      let videoAppended = false;
      // Only append the fields the backend expects: 'content', 'images' (array) and optional 'video'
      imageFiles.forEach((file) => {
        if (file.type.startsWith('video/')) {
          if (!videoAppended) {
            formData.append('video', file, file.name);
            videoAppended = true;
          } else {
            // if multiple videos are uploaded, append them as additional 'images' entries
            formData.append('images', file, file.name);
          }
        } else {
          formData.append('images', file, file.name);
        }
      });
      payload = formData;
    } else {
      payload = { content };
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      // Debug: log FormData entries
      if (useFormData && payload && typeof payload.entries === 'function') {
        const entries = [];
        for (const pair of payload.entries()) {
          const [k, v] = pair;
          if (v instanceof File) entries.push({ key: k, name: v.name, type: v.type, size: v.size });
          else entries.push({ key: k, value: v });
        }
        console.info('CreatePost FormData entries:', entries);
      } else {
        console.info('CreatePost JSON payload:', payload);
      }

      if (useFormData) {
        await axios.post(`${API_URL}/api/posts/create-post`, payload, config);
      } else {
        config.headers['Content-Type'] = 'application/json';
        await axios.post(`${API_URL}/api/posts/create-post`, payload, config);
      }

      // Success Logic: Reset and show popup
      setContent("");
      setImages([]);
      setImageFiles([]);
      setShowSuccess(true); 
      // notify other parts of the app (Feed) that a new post was created
      try { window.dispatchEvent(new Event('post-created')); } catch (e) { /* ignore */ }
    } catch (error) {
      console.error("Error creating post:", error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        alert(`Failed to create post: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Failed to create post. See console for details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-white p-4 sm:p-6 max-w-2xl'>
      {/* Pop up Triggered Here */}
      {showSuccess && <Pops onClose={() => setShowSuccess(false)} />}

      <div className='mb-6'>
        <h1 className='text-2xl font-semibold theme-gradient-text tracking-tight'>Create Post</h1>
        <p className='text-xs text-gray-400 mt-0.5'>Share your new ideas or media with your community</p>
      </div>

      <div className='bg-white rounded-xl border border-gray-100 p-4'>
        <form onSubmit={handleSubmit} className='space-y-4'>
           {/* Your existing Image and Textarea fields remain exactly as they were */}
           <div className='flex items-start gap-3'>
             <img src={user.profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"} className='w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0' />
             <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind?..." rows={3} className='w-full text-sm text-gray-700 focus:outline-none resize-none' />
           </div>

           {images.length > 0 && (
             <div className='grid grid-cols-3 gap-2 pt-2 border-t border-gray-50'>
               {images.map((image, index) => (
                 <div key={index} className='relative aspect-square rounded-lg overflow-hidden border border-gray-100'>
                   {image.type?.startsWith('video/') ? (
                     <video controls className='w-full h-full object-cover'><source src={image.url} type={image.type} /></video>
                   ) : <img src={image.url} alt="Preview" className='w-full h-full object-cover' />}
                   <button type='button' onClick={() => removeImage(index)} className='absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full'><X size={12} /></button>
                 </div>
               ))}
             </div>
           )}

           <div className='flex items-center justify-between pt-2 border-t border-gray-50'>
             <div className='flex items-center gap-1 text-gray-400'>
               <label className='p-2 hover:bg-pink-50 hover:text-pink-500 rounded-lg cursor-pointer'>
                 <Image size={18} />
                 <input type='file' multiple accept='image/*,video/*' className='hidden' onChange={handleImageChange} />
               </label>
               <button type='button' className='p-2 hover:bg-pink-50 hover:text-pink-500 rounded-lg'><Smile size={18} /></button>
               <button type='button' className='p-2 hover:bg-pink-50 hover:text-pink-500 rounded-lg'><MapPin size={18} /></button>
             </div>
             
             <button type="submit" disabled={isSubmitting || (!content.trim() && imageFiles.length === 0)} className='px-5 py-2 text-xs cursor-pointer rounded-md bg-blue-500 text-white hover:bg-pink-600 disabled:opacity-50'>
               {isSubmitting ? "Publishing..." : "Publish Post"}
             </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;