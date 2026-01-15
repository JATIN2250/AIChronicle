import React, { useState, useEffect } from 'react';
import { FiUser, FiCpu, FiFileText } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Simple loading indicator (pehli jaisa hi)
const LoadingIndicator = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
  </div>
);

// 1. NAYA: PDF Generation ke liye animated loading component
const PdfLoadingIndicator = () => {
  const [step, setStep] = useState(1);
  const messages = [
    "Great! I will start generating the report. Please wait...",
    "Fetching the latest news headlines...",
    "Summarizing articles with AI...",
    "Building your PDF document...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev < messages.length ? prev + 1 : prev));
    }, 2500); // Har 2.5 second mein naya message dikhayein

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col gap-2">
      {messages.slice(0, step).map((msg, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm"
        >
          {msg}
        </motion.div>
      ))}
      {/* Aakhri step par loading dots dikhayein */}
      {step === messages.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <LoadingIndicator />
        </motion.div>
      )}
    </div>
  );
};


const ChatMessage = ({ message, onViewPdf }) => {
  const isUser = message.sender === 'user';
  const isLoading = message.sender === 'loading';
  const isPdf = message.type === 'pdf';
  const isPdfPrompt = message.type === 'pdf_prompt'; // 2. Naya type check
  const isPdfLoading = message.type === 'pdf_loading'; // 3. Naya type check

  const baseClasses = "max-w-xl w-fit mb-4 px-4 py-3 rounded-2xl";
  
  // 4. Style update: PDF se related sabhi messages ab purple honge
  const senderClasses = isUser
    ? "bg-blue-600 text-white self-end rounded-br-lg"
    : (isPdf || isPdfPrompt || isPdfLoading)
      ? "bg-purple-800 text-white self-start rounded-bl-lg"
      : "bg-slate-700 text-slate-200 self-start rounded-bl-lg";

  const Avatar = ({ icon }) => (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3">
      {icon}
    </div>
  );

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start ${isUser ? 'flex-row-reverse' : ''}`}>
        {!isUser && <Avatar icon={<FiCpu size={16} className="text-slate-400" />} />}
        
        {/* 5. NAYA: Render logic update kiya gaya */}
        <div className={`${baseClasses} ${senderClasses}`}>
          {isLoading ? (
            <LoadingIndicator /> // Normal loading
          ) : isPdfLoading ? (
            <PdfLoadingIndicator /> // PDF loading animation
          ) : isPdf ? (
            // Final PDF button
            <div className="flex flex-col gap-3">
              <p className="whitespace-pre-wrap">{message.text}</p>
              <button 
                onClick={() => onViewPdf(message)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-500 transition-colors"
              >
                <FiFileText size={18} />
                View News Report
              </button>
            </div>
          ) : (
            // Normal text ya pdf_prompt
            <p className="whitespace-pre-wrap">{message.text}</p>
          )}
        </div>

        {isUser && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center ml-3">
          <FiUser size={16} className="text-slate-400" />
        </div>}
      </div>
    </div>
  );
};

export default ChatMessage;