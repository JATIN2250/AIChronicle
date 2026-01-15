import React, { useState, useEffect } from 'react';
// 1. Import useNavigate
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import LoginSignUp from './components/LoginSignUp';
import GlobalLoader from './components/GlobalLoader';
import SplashCursor from './components/SplashCursor/SplashCursor.jsx';

// Main App component: Manages state and global providers
function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isSplashCursor, setIsSplashCursor] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  const toggleSplashCursor = () => setIsSplashCursor(prev => !prev);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/'; // Forces a clean reload to landing
  };

  return (
    <div>
      <AnimatePresence>
        {isLoading && <GlobalLoader />}
      </AnimatePresence>
      
      {isSplashCursor && <SplashCursor />}

      <div className={`transition-filter duration-300 ${isLoading ? 'filter blur-sm' : ''}`}>
        <BrowserRouter>
          {/* 2. This sub-component contains all routes and can use hooks */}
          <AppRoutes
            user={user}
            setUser={setUser}
            isLoginModalOpen={isLoginModalOpen}
            openLoginModal={openLoginModal}
            closeLoginModal={closeLoginModal}
            isSplashCursor={isSplashCursor}
            toggleSplashCursor={toggleSplashCursor}
            handleLogout={handleLogout}
          />
        </BrowserRouter>
      </div>
    </div>
  );
}

// 3. This new component can use the useNavigate hook
const AppRoutes = ({
  user, setUser, isLoginModalOpen, openLoginModal, closeLoginModal,
  isSplashCursor, toggleSplashCursor, handleLogout
}) => {
  
  const navigate = useNavigate(); // Initialize navigate hook

  // 4. This function now handles setting state, closing modal, AND navigating
  const handleLoginSuccess = (userData) => {
    setUser(userData);       // Set the user in App.jsx
    closeLoginModal();    // Close the modal
    navigate('/chat');      // Navigate to the chat page
  };

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPage 
              onLoginClick={openLoginModal}
              user={user}
              isSplashCursor={isSplashCursor}
              onToggleSplashCursor={toggleSplashCursor}
              onLogout={handleLogout}
            />
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ChatInterface 
              user={user}
              isSplashCursor={isSplashCursor}
              onToggleSplashCursor={toggleSplashCursor}
              onLogout={handleLogout}
              onLoginClick={openLoginModal}
              onUserUpdate={setUser} 
            />
          } 
        />
      </Routes>

      <AnimatePresence>
        {isLoginModalOpen && (
          <LoginSignUp 
            onClose={closeLoginModal} 
            onLoginSuccess={handleLoginSuccess} // 5. Use the new handler
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;