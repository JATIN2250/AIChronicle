import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSettings, 
  FiUser, 
  FiLogOut, 
  FiLogIn, 
  FiCamera, 
  FiHelpCircle // 1. Imported FiHelpCircle
} from 'react-icons/fi';

// 2. Added 'onShowInstructions' prop
const UserInfoPopup = ({ 
  onClose, 
  user, 
  isCursorEnabled, 
  onToggleCursor, 
  onLogout, 
  onLoginClick, 
  onUserUpdate,
  onShowInstructions // <-- 2. Accepted new prop
}) => {
  
  // File upload ke liye state aur ref
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Backend URL (Port 3001)
  const BACKEND_URL = 'http://localhost:3001';

  const handleLoginClick = () => {
    onClose();
    onLoginClick();
  };

  // File input ko trigger karne ke liye function
  const handlePhotoClick = () => {
    if (user) {
      fileInputRef.current.click();
    }
  };

  // File upload ka logic
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('userPhoto', file);

    try {
      // Backend (routes/userRoute.js) mein /api/photo route ko call karein
      const response = await fetch(`${BACKEND_URL}/api/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Expired token check karein
        if (response.status === 401) {
          alert('Your session has expired. Please login again.');
          onLogout();
        }
        throw new Error(data.message || 'Upload failed');
      }

      // Upload safal hua!
      localStorage.setItem('user', JSON.stringify(data.user)); // localStorage update karein
      onUserUpdate(data.user); // Global state update karein (taaki Header turant refresh ho)

    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-end z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-slate-800 h-screen w-80 shadow-2xl p-6 border-l border-slate-700 flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: "0%" }}
        exit={{ x: "100%" }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* --- Profile Section --- */}
        {user ? (
          // Agar user LOGGED IN hai
          <div className="flex items-center gap-4">
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              className="hidden" 
              accept="image/*" 
            />
            {/* Profile Picture (ab clickable hai) */}
            <div 
              className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-500 cursor-pointer group"
              onClick={handlePhotoClick}
            >
              <img 
                // Poora URL (3001 port ke saath)
                src={user.userPhoto ? `${BACKEND_URL}${user.userPhoto}` : `https://placehold.co/64x64/64748B/E2E8F0?text=${user.userName[0]}`} 
                alt={user.userName}
                className={`h-full w-full object-cover ${isUploading ? 'opacity-50' : ''}`} // Uploading ke waqt blur karein
              />
              {/* Hover effect */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                <FiCamera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {/* Loading spinner */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-t-white border-slate-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">{user.userName}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
        ) : (
          // Agar user GUEST hai
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
              <FiUser size={30} className="text-slate-400" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">Guest User</h2>
              <p className="text-sm text-slate-400">Welcome!</p>
            </div>
          </div>
        )}
        {/* Error message dikhane ki jagah */}
        {uploadError && <p className="text-red-400 text-sm mt-2">{uploadError}</p>}

        <hr className="border-slate-600 my-6" />

        {/* --- Settings Section --- */}
        <div className="flex-grow flex flex-col">
          <h3 className="text-slate-400 text-sm font-semibold mb-4 flex items-center gap-2">
            <FiSettings />
            SETTINGS
          </h3>
          <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
            <label htmlFor="splash-toggle" className="text-white font-medium cursor-pointer">
              Splash Cursor
            </label>
            <button
              id="splash-toggle"
              onClick={onToggleCursor}
              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 ${isCursorEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isCursorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* 3. --- NEW INSTRUCTIONS BUTTON --- */}
          <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg mt-4">
            <label htmlFor="instructions-btn" className="text-white font-medium">
              Show Instructions
            </label>
            <button
              id="instructions-btn"
              onClick={onShowInstructions} // This function is passed from chatInterface
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-500 transition-colors"
            >
              <FiHelpCircle size={16} />
              Show
            </button>
          </div>
          {/* 3. --- END OF NEW SECTION --- */}


          {/* Logout/Login Button */}
          <div className="mt-auto pt-6">
            {user ? (
              <motion.button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 py-3 bg-red-800 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiLogOut />
                Logout
              </motion.button>
            ) : (
              <motion.button
                onClick={handleLoginClick}
                className="w-full flex items-center justify-center gap-3 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiLogIn />
                Login / Sign Up
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserInfoPopup;