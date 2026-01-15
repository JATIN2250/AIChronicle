import React from 'react';
import { motion } from 'framer-motion';

const GlobalLoader = () => {
  return (
    // Yeh poori screen ko cover karega
    <motion.div
      className="fixed inset-0 z-50 flex justify-center items-center bg-slate-900 bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Yeh loading spinner hai */}
      <div className="w-16 h-16 border-4 border-t-blue-500 border-slate-700 rounded-full animate-spin"></div>
    </motion.div>
  );
};

export default GlobalLoader;
