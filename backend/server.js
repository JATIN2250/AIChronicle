require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 1. db.js se dono cheezein import karein
const db = require('./db.js'); 
const userRoute = require('./routes/userRoute.js');
const chatRoute = require('./routes/chatRoute.js'); 

const app = express();
const PORT = 3001;

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- API Routes ---
app.use('/api', userRoute);
app.use('/api', chatRoute);

// 2. NAYA: Server start karne ke liye ek async function
const startServer = async () => {
  try {
    // 3. Pehle database ko initialize hone ka intezaar (await) karein
    await db.initializeDatabase();
    
    // 4. Jab database ready ho, tabhi server start karein
    const server = app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
    server.on('error', (err) => {
    console.error('Server error:', err);
    });

  } catch (error) {
    // Yeh error tabhi aayega agar initializeDatabase fail ho
    console.error("Failed to start server:", error);
   
  }
};

// 5. Server start function ko call karein
startServer();
