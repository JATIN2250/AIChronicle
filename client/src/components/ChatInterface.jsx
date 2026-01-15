// chatInterface.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import MainPart from './MainPart';
import UserInfoPopup from './UserInfoPopup';
import ChatHistorySidebar from './ChatHistorySidebar';
import PdfPreview from './PdfPreview';
import LoginPromptModal from './LoginPromptModal'; 
import WelcomeStepper from './WelcomeStepper';
import { v4 as uuidv4 } from 'uuid'; // 1. Import uuid (npm install uuid)

const ChatInterface = ({ user, isSplashCursor, onToggleSplashCursor, onLogout, onLoginClick, onUserUpdate }) => {
  // ... (all existing state is fine) ...
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [activeChatId, setActiveChatId] = useState(
    () => localStorage.getItem('activeChatId') || null
  );
  const [messages, setMessages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfContext, setPdfContext] = useState(null);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  
  const abortControllerRef = useRef(null);
  const startNew = location.state?.startNewChat || false;

  // ... (closePdfPreview, handleViewPdf, handleNewChat, loadChatHistory, handleSelectChat) ...
  // ... (handleOpenSidebar, fetchChatList, loadUserSession, useEffects, handleStopResponse) ...
  // ... (callGeneratePdfAPI) ...

  // Make sure you have this exact version of closePdfPreview (from our last fix)
  const closePdfPreview = () => {
    setPdfUrl(null);
    setPdfContext(null);
  };
  
  // (Your other functions)
  const handleViewPdf = (message) => {
    if (pdfUrl === message.url) {
      closePdfPreview();
    } else {
      setPdfUrl(message.url);
      setPdfContext(message.context);
    }
  };

  const handleNewChat = () => {
    handleStopResponse(); 
    setMessages([]);
    setActiveChatId(null);
    setPdfUrl(null);
    setPdfContext(null);
    localStorage.removeItem('activeChatId');
    localStorage.removeItem('chatMessages'); 
    setIsSidebarOpen(false);
  };

  const loadChatHistory = (historyData) => {
    setMessages(historyData);
    // This is the fix for the PDF re-opening on refresh
    setPdfUrl(null);
    setPdfContext(null);
  };

  const handleSelectChat = async (chatId) => {
    handleStopResponse();
    setIsSidebarOpen(false);
    setIsAiLoading(true);
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3001/api/chat/${chatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        loadChatHistory(data); 
        setActiveChatId(String(chatId));
      } else {
        if (res.status === 401) {
          alert('Your session has expired. Please login again.');
          onLogout();
        }
        console.error('Failed to fetch chat messages');
        handleNewChat();
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
    setIsAiLoading(false);
  };

  const handleOpenSidebar = () => {
    if (!user) {
      setIsLoginPromptOpen(true);
    } else {
      fetchChatList();
      setIsSidebarOpen(true);
    }
  };

  const fetchChatList = async () => {
    const token = localStorage.getItem('token');
    if (!user || !token) return [];

    try {
      const res = await fetch('http://localhost:3001/api/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatList(data);
        return data;
      } else {
        if (res.status === 401) {
          alert('Your session has expired. Please login again.');
          onLogout();
        }
        console.error('Failed to fetch chat list');
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch chat list:', error);
      return [];
    }
  };

  const loadUserSession = async () => {
    if (startNew) {
      handleNewChat(); 
      window.history.replaceState({}, document.title); 
      return;
    }
    
    if (user) {
      setIsAiLoading(true);
      const chatListData = await fetchChatList();
      const lastActiveChatId = localStorage.getItem('activeChatId');
      const isValidLastChat = chatListData.some(chat => String(chat.chatid) === lastActiveChatId);

      // This is the fix for the "new chat" refresh problem
      if (lastActiveChatId && isValidLastChat) {
        await handleSelectChat(lastActiveChatId);
      } else {
        setMessages([]);
        setActiveChatId(null);
        setIsAiLoading(false);
      }
      
      const userId = user.userId;
      const welcomeFlagKey = `hasSeenWelcome_${userId}`;
      
      if (userId && !localStorage.getItem(welcomeFlagKey)) {
        setIsWelcomeModalOpen(true);
        localStorage.setItem(welcomeFlagKey, 'true');
      }
    } 
    else {
      const guestMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
      loadChatHistory(guestMessages);
    }
  };
 
  useEffect(() => {
    loadUserSession();
    return () => {
      handleStopResponse();
    }
  }, [user, startNew]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages, user]);

  useEffect(() => {
    if (user && activeChatId) {
      localStorage.setItem('activeChatId', activeChatId);
    }
  }, [activeChatId, user]);

  const handleStopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsAiLoading(false);
      setMessages(prevMessages => prevMessages.filter(msg => msg.sender !== 'loading' && msg.type !== 'pdf_loading'));
    }
  };

  const callGeneratePdfAPI = async (loadingMessage) => {
    const token = localStorage.getItem('token');
    let endpoint = '/api/chat/generate-pdf';
    let options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ chatId: activeChatId }),
    };

    try {
      const response = await fetch(`http://localhost:3001${endpoint}`, options);
      if (!response.ok) {
        throw new Error('PDF Generation Failed');
      }
      const pdfResponse = await response.json(); 

      setMessages(prevMessages => {
        const newMessages = prevMessages.filter(msg => msg.id !== loadingMessage.id);
        return [...newMessages, pdfResponse]; // Use pdfResponse which has DB ID
      });
      setPdfUrl(pdfResponse.url);
      setPdfContext(pdfResponse.context);

    } catch (error) {
      console.error(error);
      setMessages(prevMessages => {
        const newMessages = prevMessages.filter(msg => msg.id !== loadingMessage.id);
        return [...newMessages, { id: uuidv4(), sender: 'ai', text: `Sorry, I failed to generate the PDF. Please try again.` }];
      });
    } finally {
      setIsAiLoading(false);
      abortControllerRef.current = null;
    }
  };


  // ... (handleSendMessage is fine) ...
  const handleSendMessage = async (userMessage) => {
    if (isAiLoading) return;
    setIsAiLoading(true);

    abortControllerRef.current = new AbortController();

    // 2. Use uuid for NEW user messages
    const userMessageObject = { id: uuidv4(), sender: 'user', text: userMessage };
    // Use uuid for loading message
    const loadingMessageObject = { id: uuidv4(), sender: 'loading', text: '...' };
    
    const currentMessages = [...messages, userMessageObject, loadingMessageObject];
    setMessages(currentMessages);
    
    const history = messages.map(m => ({ sender: m.sender, text: m.text, type: m.type, url: m.url, context: m.context }));

    try {
      let response;
      const token = localStorage.getItem('token');
      const body = { message: userMessage, history: history, pdfContext: pdfContext };
      let endpoint = '';
      let options = {};

      if (user && token) {
        endpoint = activeChatId ? `/api/chat/${activeChatId}` : '/api/chat/new';
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: activeChatId ? JSON.stringify(body) : JSON.stringify({ message: userMessage }),
          signal: abortControllerRef.current.signal,
        };
      } else {
        endpoint = '/api/chat/guest';
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history.concat(userMessageObject), pdfContext: pdfContext }),
          signal: abortControllerRef.current.signal,
        };
      }

      response = await fetch(`http://localhost:3001${endpoint}`, options);

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          alert('Your session has expired. Please login again.');
          onLogout();
        }
        throw new Error(errorData.message || 'API Error');
      }

      const aiResponse = await response.json();
      
      if (aiResponse.chatId) { 
        setActiveChatId(String(aiResponse.chatId)); 
        loadChatHistory(aiResponse.messages);
        setIsAiLoading(false);
      } else {
        // AI response from DB has 'id', guest responses have 'id: Date.now()'
        const aiMessageWithId = aiResponse;
        
        setMessages(prevMessages => {
          const newMessages = prevMessages.filter(msg => msg.id !== loadingMessageObject.id);
          return [...newMessages, aiMessageWithId];
        });

        if (aiResponse.type === 'pdf_loading') {
          await callGeneratePdfAPI(aiMessageWithId);
        } else if (aiResponse.type === 'pdf') {
          setPdfUrl(aiResponse.url);
          setPdfContext(aiResponse.context);
          setIsAiLoading(false);
        } else if (aiResponse.type === 'pdf_close') {
          closePdfPreview();
          setIsAiLoading(false);
        } else if (aiResponse.type === 'login_required') {
          setIsLoginPromptOpen(true);
          setIsAiLoading(false);
        } else {
          setIsAiLoading(false);
        }
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted by user.');
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== loadingMessageObject.id));
      } else {
        console.error(error);
        setMessages(prevMessages => {
          const newMessages = prevMessages.filter(msg => msg.id !== loadingMessageObject.id);
          // 3. Use uuid for error messages
          return [...newMessages, { id: uuidv4(), sender: 'ai', text: `Sorry, an error occurred: ${error.message}` }];
        });
      }
      setIsAiLoading(false);
      abortControllerRef.current = null;
    }
  };


  // 4. --- NEW FUNCTION: handleFileUpload ---
  const handleFileUpload = async (file) => {
    if (!user) return; // Guest check
    setIsAiLoading(true);

    // Create a temporary loading message
    const loadingMessageObject = { 
      id: uuidv4(), 
      sender: 'loading', 
      text: `Uploading ${file.name}...` 
    };
    setMessages(prev => [...prev, loadingMessageObject]);

    const formData = new FormData();
    formData.append('userPdf', file); // 'userPdf' must match backend (multer)
    
    // We must send the activeChatId to the backend
    // If no chat is active, the backend must create one
    if (activeChatId) {
      formData.append('chatId', activeChatId);
    }
    
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3001/api/upload/pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed.');
      }

      const pdfResponse = await response.json();
      
      // If a new chat was created, we get back { chatId, messages }
      if (pdfResponse.chatId && pdfResponse.messages) {
        setActiveChatId(String(pdfResponse.chatId));
        setMessages(pdfResponse.messages);
        // Find the PDF message in the new history to open it
        const pdfMsg = pdfResponse.messages.find(m => m.type === 'pdf');
        if (pdfMsg) {
          setPdfUrl(pdfMsg.url);
          setPdfContext(pdfMsg.context);
        }
      } 
      // If file was added to existing chat, we get back just the message
      else {
        setMessages(prevMessages => {
          const newMessages = prevMessages.filter(msg => msg.id !== loadingMessageObject.id);
          return [...newMessages, pdfResponse]; // Add the new PDF message
        });
        setPdfUrl(pdfResponse.url);
        setPdfContext(pdfResponse.context);
      }

    } catch (error) {
      console.error(error);
      setMessages(prevMessages => {
        const newMessages = prevMessages.filter(msg => msg.id !== loadingMessageObject.id);
        return [...newMessages, { id: uuidv4(), sender: 'ai', text: `Sorry, I failed to upload ${file.name}.` }];
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // 5. --- NEW FUNCTION: handleDeleteChat ---
  const handleDeleteChat = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this chat history?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat.');
      }

      // Remove from the sidebar list
      setChatList(prev => prev.filter(chat => chat.chatid !== chatId));

      // If the active chat was deleted, start a new chat
      if (activeChatId === String(chatId)) {
        handleNewChat();
      }

    } catch (error) {
      console.error(error);
      alert('Sorry, an error occurred while deleting the chat.');
    }
  };

  const togglePopup = () => setIsPopupOpen(prevState => !prevState);
  const handleShowInstructions = () => {
    setIsPopupOpen(false);
    setIsWelcomeModalOpen(true);
  };

  return (
    <>
      <ChatHistorySidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chatList={chatList}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        activeChatId={activeChatId}
        onDeleteChat={handleDeleteChat} // 6. Pass prop
      />

      <div className="flex h-screen bg-[rgb(33,37,41)]">
        <div className={`relative min-h-screen ${pdfUrl ? 'w-1/2' : 'w-full'} transition-all duration-500 ease-in-out bg-[rgb(33,37,41)]`}>
          <Header 
            onProfileClick={togglePopup} 
            user={user} 
            onNewChat={handleNewChat}
            onPrevChat={handleOpenSidebar}
          />
          <MainPart 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isAiLoading={isAiLoading}
            onStopResponse={handleStopResponse}
            onViewPdf={handleViewPdf}
            user={user} // 7. Pass user prop
            onFileUpload={handleFileUpload} // 8. Pass prop
          />
        </div>
        
        <PdfPreview 
          pdfUrl={pdfUrl} 
          onClose={closePdfPreview}
        />
      </div>

      {isPopupOpen && (
        <UserInfoPopup
          onClose={togglePopup}
          user={user}
          isCursorEnabled={isSplashCursor}
          onToggleCursor={onToggleSplashCursor}
          onLogout={onLogout}
          onLoginClick={onLoginClick}
          onUserUpdate={onUserUpdate}
          onShowInstructions={handleShowInstructions}
        />
      )}
      
      {isLoginPromptOpen && (
        <LoginPromptModal
          onClose={() => setIsLoginPromptOpen(false)}
          onLoginClick={() => {
            setIsLoginPromptOpen(false);
            onLoginClick();
          }}
        />
      )}

      {isWelcomeModalOpen && (
        <WelcomeStepper 
          user={user} 
          onClose={() => setIsWelcomeModalOpen(false)} 
        />
      )}
    </>
  );
};

export default ChatInterface;