// MainPart.jsx

import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiSquare, FiPaperclip } from 'react-icons/fi'; // 1. Add FiPaperclip
import ChatMessage from './ChatMessage';
import TextType from './TextType/TextType.jsx';

// 2. Add 'user' and 'onFileUpload' props
const MainPart = ({ messages, onSendMessage, isAiLoading, onStopResponse, onViewPdf, user, onFileUpload }) => {
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef(null);
  
  // 3. Add ref for the hidden file input
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isAiLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  // 4. Handle file input click
  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  // 5. Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col pt-20">
      
      <div className="flex-grow overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto h-full">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300 mb-2">
                Hello, How can I help you today?
              </h1>
              <div className="text-2xl text-slate-400">
                <TextType 
                  text={[
                    "Ask me about recent news.",
                    "Get a summary of any topic.",
                    "Let's explore something new!"
                  ]} 
                  deletingSpeed={50} 
                  loop={true}
                />
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage 
                key={msg.id} // <-- Make sure you fixed this from last time
                message={msg} 
                onViewPdf={onViewPdf} 
              />
            ))
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      
      {/* --- Input Form Section --- */}
      <div className="w-full p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto relative flex items-center">
          
          {/* 6. Add hidden file input */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf" // Only accept PDF
          />

          {/* 7. Add Attach Button */}
          <button
            type="button"
            onClick={handleFileClick}
            disabled={!user || isAiLoading} // Disable for guests or while AI is loading
            className="p-3 text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed"
            title={!user ? "Login to upload files" : "Attach PDF"}
          >
            <FiPaperclip size={22} />
          </button>

          <input 
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isAiLoading ? 'AI is typing...' : 'Ask me anything...'}
            disabled={isAiLoading}
            title={isAiLoading ? 'Previous request is under process' : 'Type your message'}
            className='w-full h-14 pl-4 pr-16 rounded-full bg-slate-800 border border-slate-700 text-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700'
          />
          
          {isAiLoading ? (
            <button 
              type="button"
              onClick={onStopResponse}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors duration-200 focus:outline-none"
              title="Stop response generation"
            >
              <FiSquare size={20} />
            </button>
          ) : (
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 rounded-full text-white hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none"
              disabled={!inputValue.trim()}
              title="Send message"
            >
              <FiSend size={20} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default MainPart;