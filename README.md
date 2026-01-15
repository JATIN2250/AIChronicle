AIChronicle: Intelligent News Analysis & Reporting System 📰🚀

AIChronicle is a cutting-edge, full-stack application designed to revolutionize how we consume and analyze news. By bridging the gap between real-time data streams and generative AI, the system fetches live news from India, synthesizes professional multi-page PDF reports, and provides an interactive Chat interface (RAG) to query the report's content.

🌟 Key Features

Real-time India News Integration: Fetches top headlines dynamically from India using the GNews API, covering Sports, Finance, Technology, and Politics.

AI-Powered Synthesis: Utilizes the Google Gemini 2.5 Flash model to transform raw news data into high-quality, professional summaries.

Automated Document Engineering: Generates complex, multi-page PDF documents featuring:

Dynamic Table of Contents (Clickable destinations).

Structured Chapters with detailed elaborations (4-5 paragraphs per topic).

Sub-topics and Bulleted Analysis.

Interactive Contextual Q&A (RAG): Implements Retrieval-Augmented Generation. Users can ask the AI specific questions about the generated PDF, and the assistant provides answers based only on the report's context.

Split-Screen Workspace: A fluid UI that allows users to chat on the left while previewing the live PDF document on the right.

Secure Authentication & Profiles: A full JWT-based auth system with persistent chat history and customizable user profiles (photo uploads).

Premium Design: A modern charcoal-themed interface (rgb(33, 37, 41)) with smooth animations powered by Framer Motion.

🛠️ Technical Architecture

Frontend (Client-Side)

Framework: React.js (Vite)

Styling: Tailwind CSS (Custom Color Palettes)

Animations: Framer Motion

Icons: Lucide / React Icons (Fi)

State Management: React Hooks (useState, useEffect) with persistent localStorage sync.

Backend (Server-Side)

Runtime: Node.js & Express

Database: PostgreSQL (Relational storage for Users, Chats, and Messages)

AI Engine: Google Generative AI (Gemini SDK)

PDF Engine: PDFKit

Security: JSON Web Tokens (JWT) & Bcryptjs (Password hashing)

File Handling: Multer (Profile and PDF storage)

📂 Project Hierarchy

AIChronicle/
├── backend/                        # Server-side Application
│   ├── middleware/                 # Auth & Security logic
│   ├── routes/                     # API (Chat, User, Photo routes)
│   ├── uploads/                    # User Photos & Generated PDFs
│   ├── .env                        # Private Keys (Gemini, GNews, JWT)
│   ├── db.js                       # PostgreSQL Pool & Schema init
│   └── server.js                   # Entry Point (Port 3001)
├── client/                         # Frontend Application
│   ├── src/
│   │   ├── components/             # UI Components (Chat, Sidebar, PDFPreview)
│   │   ├── assets/                 # Branding & Styles
│   │   └── App.jsx                 # Routing & Modal logic
│   └── vite.config.js              # Build configurations
├── .gitignore                      # Git exclusion rules
└── README.md                       # Documentation


⚙️ Setup & Installation

1. Prerequisites

Node.js (v18+)

PostgreSQL installed and running

Google Gemini API Key

GNews API Key

2. Backend Installation

cd backend
npm install


Create a .env file in the backend folder:

PORT=3001
DATABASE_URL=postgres://user:password@localhost:5432/aichronicle
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
GNEWS_API_KEY=your_gnews_key


3. Frontend Installation

cd client
npm install


🚀 Execution Workflow

Database: Ensure PostgreSQL is running. The server will auto-initialize tables on startup.

Start Server: node server.js inside the backend directory.

Start Client: npm run dev inside the client directory.

Flow: - Login/Sign-up to access persistent history.

Ask for "Latest news in India".

Confirm PDF generation to trigger the PDFKit engine.

Interact with the "View News Report" button to split the screen.

Ask: "What are the key financial insights in this report?" to experience RAG.

📜 License

Developed for Engineering Project Presentation 2026. All rights reserved.

Technical Lead & Developer