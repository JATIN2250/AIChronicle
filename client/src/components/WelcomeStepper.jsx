// WelcomeStepper.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiRss, 
  FiFileText, 
  FiDownload, 
  FiMessageSquare, 
  FiXCircle,
  FiCheckCircle 
} from 'react-icons/fi';

// Define the content for each step
const steps = [
  {
    icon: FiUser,
    title: (name) => `Welcome, ${name}!`,
    content: "We're excited to have you here. Let's quickly go over what this AI chat can do for you."
  },
  {
    icon: FiRss,
    title: () => "Get Latest News",
    content: "You can get the latest news by asking the bot. Try prompts like: 'What are the latest news for today?' \n\n Note: Please include the word 'news' in your prompt to help the bot understand you faster!"
  },
  {
    icon: FiFileText,
    title: () => "AI-Powered PDF Reports",
    content: "When you ask for news, the AI will offer to generate a detailed PDF report for you. A preview will automatically appear on your screen."
  },
  {
    icon: FiDownload,
    title: () => "Download Your Report",
    content: "The PDF preview has its own controls. You can easily download the full report by clicking the download button in the previewer's toolbar."
  },
  {
    icon: FiMessageSquare,
    title: () => "Context-Aware Chat",
    content: "While the PDF is open, the bot is in 'report mode.' You can ask any questions related to the PDF content, and the bot will answer based on the report."
  },
  {
    icon: FiXCircle,
    title: () => "Closing the PDF",
    content: "To close the PDF and return to a normal chat, just say 'thank you' or 'thanks'. The bot will ask for confirmation to close the preview and clear the context."
  },
  {
    icon: FiCheckCircle,
    title: () => "You're All Set!",
    content: "You're ready to go. Feel free to explore and ask anything. Enjoy the chat!"
  }
];

// Animation variants for the slide transition
const slideVariants = {
  hidden: (direction) => ({
    opacity: 0,
    x: direction > 0 ? '100%' : '-100%',
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', damping: 15, stiffness: 100 }
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? '-100%' : '100%',
    transition: { type: 'spring', damping: 15, stiffness: 100 }
  })
};

const WelcomeStepper = ({ user, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(s => s - 1);
    }
  };

  const stepData = steps[currentStep];
  const userName = user?.userName ? user.userName.split(' ')[0] : 'User';

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // Close on backdrop click
    >
      <motion.div
        className="relative w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
      >
        {/* Content Area with Animation */}
        <div className="p-8 h-80 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute w-full px-8"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <stepData.icon size={40} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {stepData.title(userName)}
              </h2>
              <p className="text-lg text-slate-300 whitespace-pre-line">
                {stepData.content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center pb-4 gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentStep ? 'bg-blue-500 scale-125' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center p-6 bg-slate-900/50 border-t border-slate-700">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Skip
          </button>
          
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-5 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
              >
                Finish
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeStepper;