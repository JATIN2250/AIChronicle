# 📰 AIChronicle — Intelligent News Analysis & Reporting System 🚀

AIChronicle is a **full-stack AI-powered news intelligence platform** designed to transform how news is consumed, analyzed, and explored.  
It bridges **real-time Indian news data** with **generative AI**, producing **professional multi-page PDF reports** and enabling **context-aware Q&A** using Retrieval-Augmented Generation (RAG).

---

## 🌟 Key Features

### 🗞️ Real-Time Indian News Integration
- Fetches live top headlines from India using the **GNews API**
- Covers **Sports, Finance, Technology, and Politics**

### 🤖 AI-Powered News Synthesis
- Uses **Google Gemini 2.5 Flash** to convert raw news into:
  - Clear summaries
  - Deep analytical narratives
  - Human-readable professional reports

### 📄 Automated PDF Document Engineering
Generates structured, multi-page PDF reports with:
- Clickable **Table of Contents**
- Topic-wise **chapters** (4–5 detailed paragraphs each)
- Sub-topics with **bullet-point analysis**
- Professional layout via **PDFKit**

### 💬 Interactive Contextual Q&A (RAG)
- Implements **Retrieval-Augmented Generation**
- Users can ask questions **only based on the generated PDF**
- Ensures factual, hallucination-free responses

### 🖥️ Split-Screen Workspace
- Chat interface on the left
- Live PDF preview on the right
- Smooth and responsive user experience

### 🔐 Secure Authentication & User Profiles
- JWT-based authentication
- Encrypted passwords with **bcrypt**
- Persistent chat history
- Profile photo uploads

### 🎨 Premium UI & UX
- Modern **charcoal-themed design** (`rgb(33, 37, 41)`)
- Smooth animations powered by **Framer Motion**
- Clean, minimal, professional layout

---

## 🛠️ Technical Architecture

### Frontend (Client-Side)
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide Icons / React Icons
- **State Management:** React Hooks
- **Persistence:** LocalStorage

### Backend (Server-Side)
- **Runtime:** Node.js & Express
- **Database:** PostgreSQL
- **AI Engine:** Google Gemini SDK
- **PDF Engine:** PDFKit
- **Security:** JWT & BcryptJS
- **File Handling:** Multer

---



## 📂 Project Structure

```text
AIChronicle/
├── backend/                         # Server-side application
│   ├── middleware/                  # Authentication & security
│   ├── routes/                      # API routes (User, Chat, Uploads)
│   ├── uploads/                     # Profile images & generated PDFs
│   ├── .env                         # Environment variables
│   ├── db.js                        # PostgreSQL pool & schema setup
│   └── server.js                    # Backend entry point (Port 3001)
├── client/                          # Frontend application
│   ├── src/
│   │   ├── components/              # Chat, Sidebar, PDF Preview
│   │   ├── assets/                  # Branding & styles
│   │   └── App.jsx                  # Routing & modal logic
│   └── vite.config.js               # Vite configuration
├── .gitignore                       # Git exclusions
└── README.md                        # Project documentation

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL
- Google Gemini API Key
- GNews API Key

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=3001
DATABASE_URL=postgres://user:password@localhost:5432/aichronicle
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GNEWS_API_KEY=your_gnews_api_key
```

### Frontend Setup
```bash
cd client
npm install
```

---

## 🚀 Run Application

```bash
cd backend
node server.js
```

```bash
cd client
npm run dev
```

---

## 📜 License

Developed for **Engineering Project Presentation – 2026**  
© All rights reserved.

---

## 👨‍💻 Technical Lead & Developer
**Jitendra Tulswani**
