import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiLock, FiCamera } from 'react-icons/fi';

// FormInput component (pehli jaisa hi)
const FormInput = ({ icon, type, placeholder, value, onChange, name }) => (
  <div className="relative w-full">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
      {icon}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      className="w-full h-12 pl-10 pr-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
  </div>
);

// Form animation variants (pehli jaisa hi)
const formVariants = {
  hidden: (direction) => ({ opacity: 0, x: direction > 0 ? 100 : -100 }),
  visible: { opacity: 1, x: 0, transition: { type: 'tween', duration: 0.3 } },
  exit: (direction) => ({ opacity: 0, x: direction > 0 ? -100 : 100, transition: { type: 'tween', duration: 0.3 } })
};

// 1. Naya prop 'onLoginSuccess' accept karein (App.jsx se)
const LoginSignUp = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [direction, setDirection] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', userPass: '' });
  const [signUpForm, setSignUpForm] = useState({ userName: '', email: '', userPass: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // Note: We keep useNavigate here for the Sign Up -> Login toggle logic
  // but we remove it from the submit handler.
  const navigate = useNavigate(); 

  // --- Change Handlers (pehli jaise hi) ---
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSignUpChange = (e) => {
    setSignUpForm({ ...signUpForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const toggleForm = () => {
    setDirection(isLogin ? 1 : -1);
    setIsLogin(prevState => !prevState);
    setErrorMessage('');
  };

  // --- Submit Handlers ---

  // 2. Login Submit (Updated)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      // --- YAHAN BADLAAV HAI ---
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Just call onLoginSuccess. App.jsx will close the modal and navigate.
      onLoginSuccess(data.user); 
      // onClose(); // <-- REMOVED
      // navigate('/'); // <-- REMOVED

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // 3. Sign Up Submit (Updated)
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const formData = new FormData();
    formData.append('userName', signUpForm.userName);
    formData.append('email', signUpForm.email);
    formData.append('userPass', signUpForm.userPass);
    if (profileImage) {
      formData.append('userPhoto', profileImage);
    }

    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sign up failed.');
      }

      alert('Registration successful! Please login.');
      toggleForm(); // User ko login form par bhej dein

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <FiX size={24} />
        </button>
        
        <div className="p-8 pt-12">
          {errorMessage && (
            <div className="w-full p-3 mb-4 bg-red-800 border border-red-600 text-white rounded-lg text-center">
              {errorMessage}
            </div>
          )}

          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              custom={direction}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              {isLogin ? (
                // Login Form (ab 'onSubmit' use karega)
                <form className="flex flex-col items-center gap-6" onSubmit={handleLoginSubmit}>
                  <h2 className="text-3xl font-bold text-white mb-4">Welcome Back!</h2>
                  <FormInput icon={<FiMail />} type="email" placeholder="Email" name="email" value={loginForm.email} onChange={handleLoginChange} />
                  <FormInput icon={<FiLock />} type="password" placeholder="Password" name="userPass" value={loginForm.userPass} onChange={handleLoginChange} />
                  <button type="submit" className="w-full h-12 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-all transform hover:scale-105">
                    Login
                  </button>
                </form>
              ) : (
                // Sign Up Form (ab 'onSubmit' use karega)
                <form className="flex flex-col items-center gap-6" onSubmit={handleSignUpSubmit}>
                  <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                  <label className="relative w-24 h-24 mb-2 rounded-full cursor-pointer bg-slate-700 hover:bg-slate-600 transition-colors flex items-center justify-center overflow-hidden">
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <FiCamera size={30} />
                        <span className="text-xs mt-1">Upload</span>
                      </div>
                    )}
                  </label>
                  <FormInput icon={<FiUser />} type="text" placeholder="Full Name" name="userName" value={signUpForm.userName} onChange={handleSignUpChange} />
                  <FormInput icon={<FiMail />} type="email" placeholder="Email" name="email" value={signUpForm.email} onChange={handleSignUpChange} />
                  <FormInput icon={<FiLock />} type="password" placeholder="Password" name="userPass" value={signUpForm.userPass} onChange={handleSignUpChange} />
                  <button type="submit" className="w-full h-12 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-all transform hover:scale-105">
                    Sign Up
                  </button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 text-center">
            <button onClick={toggleForm} className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginSignUp;