import React from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiUser, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';

const BACKEND_URL = 'http://localhost:3001';

const LandingPagePopup = ({
  onClose,
  user,
  isSplashCursor,
  onToggleSplashCursor,
  onLogout
}) => {

  const handleLogout = () => {
    onClose();
    onLogout();
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
            <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-500">
              <img 
                src={user.userPhoto ? `${BACKEND_URL}${user.userPhoto}` : `https://placehold.co/64x64/64748B/E2E8F0?text=${user.userName[0]}`} 
                alt={user.userName}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">{user.userName}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
        ) : (
          // Agar user GUEST hai (This will rarely show, as the button is for logged-in users, but good fallback)
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
              onClick={onToggleSplashCursor}
              className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors ${
                isSplashCursor ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-flex items-center justify-center w-5 h-5 transform bg-white rounded-full transition-transform ${
                isSplashCursor ? 'translate-x-6' : 'translate-x-1'
              }`}>
                {isSplashCursor ? <FiSun size={12} className="text-blue-600" /> : <FiMoon size={12} className="text-gray-600" />}
              </span>
            </button>
          </div>

          {/* Logout/Login Button */}
          <div className="mt-auto pt-6">
            {user && ( // Only show Logout if user is logged in
              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-3 bg-red-800 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiLogOut />
                Logout
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LandingPagePopup;