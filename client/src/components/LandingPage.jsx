// LandingPage.jsx

import React, { useState } from 'react'; // 1. Import useState
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Galaxy from './Galaxy/Galaxy.jsx';
import TrueFocus from './TrueFocus/TrueFocus.jsx';
import { FiUser, FiMoon, FiSun } from 'react-icons/fi';
import LandingPagePopup from './LandingPagePopup.jsx'; // 2. Import the new popup

const BACKEND_URL = 'http://localhost:3001';

// 3. Accept 'onLogout' prop
const LandingPage = ({ onLoginClick, user, isSplashCursor, onToggleSplashCursor, onLogout }) => {
  const navigate = useNavigate();
  
  // 4. Add state for the new popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const togglePopup = () => setIsPopupOpen(prev => !prev);

  const handleTryFree = () => {
    navigate('/chat', { state: { startNewChat: true } });
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-900 text-white overflow-hidden">
      <Galaxy 
        className="absolute inset-0 z-0" 
        mouseRepulsion={true}
        mouseInteraction={true}
        density={1.5}
        glowIntensity={0.5}
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />
      <div className="relative z-20 h-screen flex flex-col">
        
        <header className="w-full p-6 flex justify-between items-center">
          {/* Logo */}
          <div className="w-16 h-16">
            <img src="src/assets/Gemini_Generated_Image_s8br6vs8br6vs8br-removebg-preview.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          
          {/* 5. MAKE THIS SECTION CLICKABLE */}
          <button 
            onClick={togglePopup} // <-- Click handler added
            className="flex items-center gap-3 px-4 py-2 border border-slate-700 rounded-full bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors"
          >
            {user ? (
              // Agar logged in hai
              <>
                <img 
                  src={user.userPhoto ? `${BACKEND_URL}${user.userPhoto}` : `https://placehold.co/40x40/64748B/E2E8F0?text=${user.userName[0]}`}  
                  alt={user.userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-semibold text-slate-300">{user.userName}</span>
              </>
            ) : (
              // Agar guest hai
              <>
                <FiUser className="text-slate-400" />
                <span className="font-semibold text-slate-300">Guest</span>
              </>
            )}
          </button>
        </header>

        <main className="flex-grow flex flex-col justify-center items-center text-center px-4">
          <div className="mb-8">
            <TrueFocus
              sentence={"Welcome to AI Chat. Explore the Future, Ask Anything."}
              pauseBetweenAnimations = {0.5}
              animationDuration = {0.3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {user ? (
              // Agar user LOGGED IN hai:
              <button 
                onClick={handleTryFree}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </button>
            ) : (
              // Agar user GUEST hai:
              <>
                <button 
                  onClick={onLoginClick}
                  className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all duration-200 transform hover:scale-105"
                >
                  Login / Sign Up
                </button>
                <button 
                  onClick={handleTryFree}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-all duration-200 transform hover:scale-105"
                >
                  Try for Free
                </button>
              </>
            )}
          </div>
          
          {/* Interactive Splash Cursor Toggle (Note: This is still here, but also in the popup) */}
          {/* <motion.div 
            className="mt-12 p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <span className="text-slate-300 font-medium">Toggle Splash Cursor</span>
            <button
              onClick={onToggleSplashCursor}
              className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 ${
                isSplashCursor ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span className="sr-only">Toggle Splash Cursor</span>
              <span
                className={`inline-flex items-center justify-center w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ${
                  isSplashCursor ? 'translate-x-6' : 'translate-x-1'
                }`}
              >
                {isSplashCursor ? <FiSun size={12} className="text-blue-600" /> : <FiMoon size={12} className="text-gray-600" />}
              </span>
            </button>
          </motion.div> */}

        </main>
      </div>

      {/* 6. RENDER THE POPUP CONDITIONALLY */}
      {isPopupOpen && (
        <LandingPagePopup
          user={user}
          onClose={togglePopup}
          isSplashCursor={isSplashCursor}
          onToggleSplashCursor={onToggleSplashCursor}
          onLogout={onLogout}
        />
      )}
    </div>
  );
};

export default LandingPage;