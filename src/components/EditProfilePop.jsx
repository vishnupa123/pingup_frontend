import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const EditProfilePop = ({ onClose, user }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    profilePic: null,
    cover_photo: null
  })

  const [previews, setPreviews] = useState({
    profilePic: user?.profilePic || '',
    cover_photo: user?.cover_photo || ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const selectedFile = files[0]
      setFormData(prev => ({ ...prev, [name]: selectedFile }))
      setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(selectedFile) }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const token = localStorage.getItem('token')

    try {
      const data = new FormData()
      if (formData.fullName) data.append('fullName', formData.fullName)
      if (formData.username) data.append('username', formData.username)
      if (formData.bio !== undefined) data.append('bio', formData.bio)
      if (formData.profilePic) data.append('profilePic', formData.profilePic)
      if (formData.cover_photo) data.append('cover_photo', formData.cover_photo)

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/users/update`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      toast.success('Profile updated successfully!')
      onClose()
      window.location.reload() // refresh to show updated data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-10 bg-black/30 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='bg-white w-full max-w-[360px] rounded-xl p-6 py-4 shadow-md border border-gray-100 flex flex-col'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-center gap-2 mb-3 text-blue-800 font-semibold text-base tracking-wide'>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>pingup</span>
        </div>

        <div className='w-full bg-pink-50 text-pink-700 text-center font-medium text-xs py-3 rounded-md mb-4 tracking-wide'>
          Edit Profile Information
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-5'>
            <div>
              <label className='block text-[11px] font-bold text-gray-700 mb-1'>Full Name</label>
              <input
                type='text'
                name='fullName'
                placeholder='Full Name'
                value={formData.fullName}
                onChange={handleChange}
                className='w-full px-2.5 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:border-pink-400 placeholder-gray-300 transition-colors'
              />
            </div>
            <div>
              <label className='block text-[11px] font-bold text-gray-700 mb-1'>Username</label>
              <input
                type='text'
                name='username'
                placeholder='Username'
                value={formData.username}
                onChange={handleChange}
                className='w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-pink-400 placeholder-gray-300 transition-colors'
              />
            </div>
          </div>

          <div>
            <label className='block text-[11px] font-bold text-gray-700 mb-1'>Bio</label>
            <textarea
              name='bio'
              rows={2}
              placeholder='Tell us about yourself...'
              value={formData.bio}
              onChange={handleChange}
              className='w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-pink-400 placeholder-gray-300 transition-colors resize-none leading-normal'
            />
          </div>

          <div>
            <label className='block text-[11px] font-bold text-gray-700 mb-1'>Profile Image</label>
            <div className='flex items-center gap-2'>
              {previews.profilePic && (
                <img
                  src={previews.profilePic}
                  alt="Profile preview"
                  className='w-7 h-7 rounded-full object-cover'
                />
              )}
              <input
                type='file'
                name='profilePic'
                accept='image/*'
                onChange={handleFileChange}
                className='w-full text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:text-[11px] file:font-medium file:bg-white file:text-blue-600 hover:file:bg-pink-50 file:cursor-pointer'
              />
            </div>
          </div>

          <div>
            <label className='block text-[11px] font-bold text-gray-700 mb-1'>Background Cover</label>
            <div className='flex items-center gap-2'>
              {previews.cover_photo && (
                <img
                  src={previews.cover_photo}
                  alt="Cover preview"
                  className='w-9 h-6 rounded object-cover border border-blue-400 shrink-0'
                />
              )}
              <input
                type='file'
                name='cover_photo'
                accept='image/*'
                onChange={handleFileChange}
                className='w-full text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-blue-400 file:text-[11px] file:font-medium file:bg-white file:text-blue-600 hover:file:bg-blue-50 file:cursor-pointer'
              />
            </div>
          </div>

          <div className='pt-2 flex flex-col gap-1.5'>
            <button
              type='submit'
              disabled={loading}
              className='w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded shadow-sm transition-colors cursor-pointer text-center disabled:opacity-60'
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
            <button
              type='button'
              onClick={onClose}
              className='w-full py-1 text-[11px] text-gray-500 hover:text-gray-500 transition-colors cursor-pointer text-center'
            >
              Cancel and close
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfilePop