import React, { useState } from 'react'
import { X, Image, Smile, Globe, ChevronDown } from 'lucide-react'
import { dummyNewUserData } from '../assets/assets'

const AddPostPop = ({ onClose, postContent, postImages, setContent, setImages }) => {
  // Fallback local states if props aren't passed from a parent view container
  const [caption, setCaption] = useState(postContent || "")
  const [selectedImages, setSelectedImages] = useState(postImages || [])
  const user = dummyNewUserData

  // Handle local image uploads directly inside the popup modal wrapper
  const handleLocalImageUpload = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => URL.createObjectURL(file))
      setSelectedImages(prev => prev.concat(filesArray))
    }
  }

  // Remove a specific image from the preview loop block list array range
  const handleRemoveImage = (indexToRemove) => {
    const updatedImages = selectedImages.filter((_, index) => index !== indexToRemove)
    setSelectedImages(updatedImages)
    if (setImages) setImages(updatedImages) // Sync back to parent if state setter exists
  }

  const handlePostSubmit = (e) => {
    e.preventDefault()
    
    // Safety Guard Check: Ensure there is at least a Caption text OR an Image attached
    if (!caption.trim() && selectedImages.length === 0) return

    console.log("Post Submitted Successfully! 🎉")
    console.log("Final Caption Content Text:", caption)
    console.log("Final Attached Media Payload Data:", selectedImages)

    // Clear tracking variables globally across contexts
    setCaption("")
    setSelectedImages([])
    if (setContent) setContent("")
    if (setImages) setImages([])
    
    onClose() // Close the popup container
  }

  return (
    <div 
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'
      onClick={onClose}
    >
      {/* Main Modal Container Card Wrapper Box */}
      {/* 🛠️ FIXED: Added a beautiful soft pink border 'border-2 border-pink-400/30' around the popup box */}
      <div 
        className='bg-white w-full max-w-[460px] rounded-2xl shadow-xl border-2 border-pink-400/30 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150'
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Section Container Strip */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
          <h2 className='text-base font-semibold text-gray-800 tracking-tight mx-auto pl-6'>Create Post</h2>
          <button 
            type='button'
            onClick={onClose}
            className='p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all cursor-pointer'
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form Submission Pipeline Context */}
        <form onSubmit={handlePostSubmit} className='p-5 space-y-4 flex-1 overflow-y-auto max-h-[80vh] no-scrollbar'>
          
          {/* User Profile Mini Header Detail Layout Grid */}
          <div className='flex items-center gap-3'>
            <img 
              src={user.profile_picture} 
              alt={user.full_name} 
              className='w-10 h-10 rounded-full object-cover border border-pink-100/40' 
            />
            <div className='flex flex-col gap-0.5'>
              <h3 className='text-sm font-semibold text-gray-800 leading-none'>{user.full_name}</h3>
              {/* Privacy pill badge layout element component info */}
              <div className='flex items-center gap-1 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full mt-1 w-max'>
                <Globe size={11} className='text-gray-500' />
                <span className='text-[10px] text-gray-500 font-medium'>Anyone can reply</span>
                <ChevronDown size={10} className='text-gray-400' />
              </div>
            </div>
          </div>

          {/* Core Textarea Description Field Segment Wrapper Container */}
          <div className='w-full h-20 pt-1 border-1 border-pink-500 p-5 rounded'>
            <textarea
              value={caption}
              onChange={(e) => {
                setCaption(e.target.value)
                if (setContent) setContent(e.target.value) // Sync with background input fields if present
              }}
              placeholder="What's on your mind? Type a caption, drop an image, or do both..."
              rows={4}
              className='w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none leading-relaxed'
            />
          </div>

          {/* Dynamic Attached Local File Image Gallery Previews Box Layout Container Grid */}
          {selectedImages.length > 0 && (
            <div className={`grid gap-2 rounded-xl overflow-hidden border border-gray-100 bg-gray-50/50 p-1.5 ${
              selectedImages.length === 1 ? 'grid-cols-1' : selectedImages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            }`}>
              {selectedImages.map((imgUrl, index) => (
                <div key={index} className='relative aspect-video sm:aspect-square rounded-lg overflow-hidden border border-gray-100/40 bg-white group shadow-sm'>
                  <img src={imgUrl} alt={`Uploaded Preview Link Frame ${index}`} className='w-[50%] h-[50%] object-cover' />
                  <button
                    type='button'
                    onClick={() => handleRemoveImage(index)}
                    className='absolute top-2 right-2 p-1 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors cursor-pointer shadow-sm'
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tool tray attachment bar layout strip footer row */}
          <div className='flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/30 shadow-inner-sm'>
            <span className='text-xs font-medium text-gray-500 pl-1'>Add media to your post</span>
            
            <div className='flex items-center gap-1 text-gray-400'>
              {/* Native System File Input Upload Area */}
              <label className='p-2  hover:text-pink-500 rounded-lg transition-colors cursor-pointer flex items-center justify-center'>
                <Image size={18} />
                <input 
                  type='file'
                  multiple
                  accept='image/*'
                  className='hidden'
                  onChange={handleLocalImageUpload}
                />
              </label>
              <button type='button' className='p-2 hover:bg-pink-50 hover:text-pink-500 rounded-md transition-colors cursor-pointer'>
                <Smile size={18} />
              </button>
            </div>
          </div>

          {/* Primary Action Button Controls Submitter Block Layout Line */}
          <div className='pt-1'>
            <button
              type='submit'
              disabled={!caption.trim() && selectedImages.length === 0}
              className={`w-full py-2.5 text-xs font-semibold rounded-md transition-all duration-200 tracking-wide text-center shadow-sm ${
                caption.trim() || selectedImages.length > 0
                  ? 'bg-pink-500 hover:bg-pink-600 text-white cursor-pointer active:scale-[0.99]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Post
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

export default AddPostPop