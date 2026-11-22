import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const resetAll = () => {
    setUsername(''); setFullName(''); setEmail(''); setPassword('');
    setConfirmPassword(''); setOtp(''); setBio(''); setLocation(''); setProfilePic(null);
    setError(''); setStep(1); setOtpSent(false);
  };

  const handleGenerateOTP = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }

    setOtpLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/api/auth/generate-otp', { email });
      if (response.data.success || response.status === 200) {
        setOtpSent(true);
        setError('');
        setStep(2);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleNext1 = (e) => {
    e.preventDefault();
    if (!username || !fullName || !email) { setError('Please fill in all fields.'); return; }
    setError('');
    handleGenerateOTP(e);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) { setError('Please enter the OTP sent to your email.'); return; }
    if (!password || !confirmPassword) { setError('Please fill in both password fields.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setError(''); setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const endpoint = isSignup
        ? 'http://localhost:8000/api/auth/signup'
        : 'http://localhost:8000/api/auth/login';
      let response;
      if (isSignup) {
        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('otp', otp.trim());
        formData.append('bio', bio);
        formData.append('location', location);
        if (profilePic) formData.append('profilePic', profilePic);
        response = await axios.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        response = await axios.post(endpoint, { email, password });
      }
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.href = '/';
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  const noEnter = (e) => { if (e.key === 'Enter') e.preventDefault(); };

  const inputClass = 'w-full p-3 mb-4 border border-blue-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white';

  // ── Buttons: the fill animates the button's own background-size,
  //    so there is no sliding pseudo-element to leave artifacts behind.
  const btnBase =
    'w-full py-3 rounded-lg text-sm font-medium border cursor-pointer bg-white bg-no-repeat ' +
    'bg-[length:0%_100%] hover:bg-[length:100%_100%] ' +
    'transition-[background-size,color,border-color] duration-500 ease-in-out ' +
    'disabled:opacity-60 disabled:cursor-not-allowed';

  const btnPrimary =
    `${btnBase} text-blue-600 border-blue-500 hover:text-white bg-left ` +
    'bg-[image:linear-gradient(#2563eb,#2563eb)]';

  const btnBack =
    `${btnBase} text-gray-500 border-gray-300 hover:text-white mb-3 bg-right ` +
    'bg-[image:linear-gradient(#6b7280,#6b7280)]';

  const StepIndicator = () => (
    <div className='flex items-center gap-2 mb-6'>
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
            ${step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
            {step > s ? '✓' : s}
          </div>
          {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-green-400' : 'bg-gray-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
      <div className='flex w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden'>

        {/* ── LEFT PANEL ── */}
        <div className='hidden md:flex flex-col justify-center px-12 py-16 flex-1'
          style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 55%, #fce7f3 100%)' }}>

          {/* Logo */}
          <div className='flex items-center gap-2 mb-12'>
            <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6 text-indigo-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M13 10V3L4 14h7v7l9-11h-7z' />
            </svg>
            <span className='text-xl font-semibold text-indigo-700'>pingup</span>
          </div>

          {/* Social proof */}
          <div className='flex items-center gap-3 mb-6'>
            <div className='flex -space-x-2'>
              {['A','B','C'].map((l, i) => (
                <div key={i} className='w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold'
                  style={{ background: ['#c7d2fe','#ddd6fe','#fbcfe8'][i], color: ['#3730a3','#5b21b6','#9d174d'][i] }}>
                  {l}
                </div>
              ))}
            </div>
            <span className='text-yellow-500 text-sm tracking-tight'>★★★★★</span>
            <span className='text-gray-500 text-xs'>Used by 12k+ developers</span>
          </div>

          {/* Headline */}
          <h1 className='text-4xl font-bold text-indigo-950 leading-tight mb-4'>
            More than just friends<br />truly connect
          </h1>
          <p className='text-gray-500 text-sm'>Connect with the global community on pingup.</p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className='bg-white w-full md:w-96 flex flex-col justify-center px-10 py-12'>

          <h2 className='text-xl font-semibold mb-6 text-gray-900'>
            {isSignup ? ['Basic info', 'Verification & Security', 'Profile'][step - 1] : 'Log in'}
          </h2>

          {isSignup && <StepIndicator />}
          {error && <p className='text-red-500 mb-4 text-xs'>{error}</p>}

          {/* LOGIN */}
          {!isSignup && (
            <form onSubmit={handleSubmit}>
              <input type='email' value={email} onChange={e => setEmail(e.target.value)}
                placeholder='Email' className={inputClass} required />
              <input type='password' value={password} onChange={e => setPassword(e.target.value)}
                placeholder='Password' className={inputClass} required />
              <button type='submit' disabled={loading} className={btnPrimary}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {/* STEP 1 */}
          {isSignup && step === 1 && (
            <form onSubmit={handleNext1}>
              <input type='text' value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder='Full name' className={inputClass} required />
              <input type='text' value={username} onChange={e => setUsername(e.target.value)}
                placeholder='Username' className={inputClass} required />
              <input type='email' value={email} onChange={e => setEmail(e.target.value)}
                placeholder='Email' className={inputClass} required />
              <button type='submit' disabled={otpLoading} className={btnPrimary}>
                {otpLoading ? 'Sending OTP...' : 'Next →'}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {isSignup && step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              {otpSent && (
                <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
                  <p className='text-xs text-green-700'>✓ OTP sent to <strong>{email}</strong></p>
                </div>
              )}
              <input type='text' value={otp} onChange={e => setOtp(e.target.value.trim())}
                placeholder='Enter OTP from your email' className={inputClass} required />
              <input type='password' value={password} onChange={e => setPassword(e.target.value)}
                placeholder='Create password' className={inputClass} required />
              <input type='password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder='Confirm password' className={inputClass} required />
              <button type='button' onClick={() => { setStep(1); setError(''); setOtpSent(false); }} className={btnBack}>
                ← Back
              </button>
              <button type='submit' disabled={loading} className={btnPrimary}>
                {loading ? 'Verifying OTP...' : 'Next →'}
              </button>
            </form>
          )}

          {/* STEP 3 */}
          {isSignup && step === 3 && (
            <form onSubmit={handleSubmit}>
              <p className='text-xs text-gray-400 mb-4'>All fields below are optional.</p>
              <input type='text' value={bio} onChange={e => setBio(e.target.value)}
                placeholder='Bio' className={inputClass} onKeyDown={noEnter} />
              <input type='text' value={location} onChange={e => setLocation(e.target.value)}
                placeholder='Location' className={inputClass} onKeyDown={noEnter} />
              <div className='mb-4'>
                <p className='text-xs text-gray-400 mb-1'>Profile picture</p>
                <div
                  className='flex items-center gap-3 w-full p-3 border border-blue-400 rounded-lg cursor-pointer hover:bg-blue-50 transition'
                  onClick={() => document.getElementById('profilePicInput').click()}>
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-blue-400 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5' />
                  </svg>
                  <span className='text-sm text-gray-400 truncate'>
                    {profilePic ? profilePic.name : 'Click to upload a photo'}
                  </span>
                </div>
                <input id='profilePicInput' type='file' accept='image/*' className='hidden'
                  onChange={e => setProfilePic(e.target.files[0])} />
              </div>
              <button type='button' onClick={() => { setStep(2); setError(''); }} className={btnBack}>
                ← Back
              </button>
              <button type='submit' disabled={loading} className={btnPrimary}>
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>
          )}

          {/* Toggle */}
          <p className='mt-6 text-sm text-gray-500 text-center'>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button type='button' onClick={() => { setIsSignup(p => !p); resetAll(); }}
              className='text-blue-600 hover:text-blue-800 font-medium cursor-pointer'>
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
