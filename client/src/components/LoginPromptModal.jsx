import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLogIn, FiLock } from 'react-icons/fi';

const LoginPromptModal = ({ onClose, onLoginClick }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10">
            <FiX size={24} />
          </button>
          
          <div className="p-8 text-center flex flex-col items-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
              <FiLock size={40} className="text-white" />
            </div>

            {/* Content */}
            <h2 className="text-3xl font-bold text-white mb-4">Feature Locked</h2>
            <p className="text-lg text-slate-300 mb-8">
              This feature is available for registered users. Please log in or create an account to generate news reports and access the full AI capabilities.
            </p>

            {/* Login Button */}
            <motion.button
              onClick={onLoginClick}
              className="w-full flex items-center justify-center gap-3 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiLogIn />
              Login / Sign Up
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginPromptModal;