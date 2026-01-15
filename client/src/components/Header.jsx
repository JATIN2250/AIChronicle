import React from 'react';
import { FiPlus, FiMessageSquare, FiUser } from 'react-icons/fi';

const BACKEND_URL = 'http://localhost:3001';


// 1. Naya prop 'onPrevChat' yahan accept karein
const Header = ({ onProfileClick, user, onNewChat, onPrevChat }) => {
    return (
        <header className="bg-slate-800/80 backdrop-blur-sm h-20 px-6 fixed top-0 w-full flex justify-between items-center shadow-lg z-20">
            
            {/* Left Side: Logo */}
            <div className="w-16 h-16 flex justify-center items-center">
                <img src="src/assets/Gemini_Generated_Image_s8br6vs8br6vs8br-removebg-preview.png" alt="Logo" className="h-full w-full object-contain" />
            </div>

            {/* Middle: Action Buttons */}
            <div className="flex gap-4">
                <button 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all duration-200"
                    onClick={onNewChat}
                >
                    <FiPlus size={20} />
                    New Chat
                </button>
                <button 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all duration-200"
                    // 2. YAHAN BADLAAV HAI: console.log ki jagah 'onPrevChat' function call karein
                    onClick={onPrevChat}
                >
                    <FiMessageSquare size={20} />
                    Prev Chat
                </button>
            </div>
            
            {/* Right Side: Profile Picture Button (Updated) */}
            <button 
                className="h-12 w-12 rounded-full overflow-hidden cursor-pointer transform hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 bg-slate-700 flex items-center justify-center" 
                onClick={onProfileClick}
            >
                {user ? (
                    // Agar user logged in hai:
                    <img 
                        src={user.userPhoto ? `${BACKEND_URL}${user.userPhoto}` : `https://placehold.co/40x40/64748B/E2E8F0?text=${user.userName[0]}`} 
                        alt={user.userName}
                        className='h-full w-full object-cover' 
                    />
                ) : (
                    // Agar user logged in nahi hai (Guest):
                    <FiUser size={24} className="text-slate-300" />
                )}
            </button>
            
        </header>
    );
};

export default Header;