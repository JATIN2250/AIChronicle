import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiTrash } from 'react-icons/fi'; // 1. Add FiTrash icon

const ChatHistorySidebar = ({
  isOpen,
  onClose,
  chatList,
  onSelectChat,
  onNewChat,
  activeChatId,
  onDeleteChat, // 2. Accept the new onDeleteChat prop
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Backdrop (Overlay) */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* 2. Sidebar Panel */}
          <motion.div
            className="fixed top-0 left-0 h-full w-72 bg-slate-800 shadow-xl z-40 flex flex-col p-6 border-r border-slate-700"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Sidebar Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Chat History</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <FiX size={24} />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors mb-4"
            >
              <FiPlus size={20} />
              Start New Chat
            </button>

            {/* Chat List */}
            <div className="flex-grow overflow-y-auto space-y-2">
              {chatList.length > 0 ? (
                chatList.map((chat) => (
                  // 3. --- THIS IS THE UPDATED BLOCK ---
                  // Changed from a <button> to a <div> with two click targets
                  <div
                    key={chat.chatid}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      String(activeChatId) === String(chat.chatid) // Use String() for safe comparison
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {/* Chat Title (Clickable) */}
                    <span
                      onClick={() => onSelectChat(chat.chatid)}
                      className="flex-grow truncate pr-2 cursor-pointer"
                    >
                      {chat.title}
                    </span>

                    {/* Delete Button (Clickable) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents onSelectChat from firing
                        onDeleteChat(chat.chatid);
                      }}
                      className={`flex-shrink-0 p-1 rounded transition-colors ${
                        String(activeChatId) === String(chat.chatid)
                          ? 'hover:bg-slate-500' // Style when active
                          : 'text-slate-500 hover:text-white hover:bg-red-500' // Style when inactive
                      }`}
                      title="Delete chat"
                    >
                      <FiTrash size={16} />
                    </button>
                  </div>
                  // --- END OF UPDATED BLOCK ---
                ))
              ) : (
                <p className="text-slate-400 text-center mt-4">No chat history found.</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatHistorySidebar;