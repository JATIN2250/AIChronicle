const { Pool } = require('pg');
// 'dotenv' ko server.js mein pehle hi load kar liya gaya hai

// Pool PostgreSQL se connect karega
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 1. Connection ko test karne ke liye ek alag, saaf-suthra function
const checkConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to PostgreSQL database!');
  } catch (err) {
    console.error('--------------------------------------------------');
    console.error('FATAL: Database connection failed:');
    console.error(err.stack);
    console.error('--------------------------------------------------');
    process.exit(1);
  } finally {
    // Client ko release karein (agar connection safal hua ho)
    if (client) {
      client.release();
    }
  }
};

// 2. Sabhi tables ke liye SQL queries
const createUserTableQuery = `
  CREATE TABLE IF NOT EXISTS userInfo (
    userId SERIAL PRIMARY KEY,
    userName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    userPass TEXT NOT NULL,
    userPhoto TEXT
  )
`;

const createChatsTableQuery = `
  CREATE TABLE IF NOT EXISTS chats (
    chatId SERIAL PRIMARY KEY,
    userId INT REFERENCES userInfo(userId) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// 3. YAHAN BADLAAV HAI: 'messages' table ko update kiya gaya hai
const createMessagesTableQuery = `
  CREATE TABLE IF NOT EXISTS messages (
    messageId SERIAL PRIMARY KEY,
    chatId INT REFERENCES chats(chatId) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL,
    text TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Naye Columns --
    type VARCHAR(20) DEFAULT 'text', -- 'text' ya 'pdf'
    url TEXT,                        -- PDF ka link
    context TEXT                     -- RAG ke liye summary
  )
`;


// 4. Initialization function ko update kiya gaya
const initializeDatabase = async () => {
  await checkConnection();
  
  try {
    await pool.query(createUserTableQuery);
    console.log('userInfo table is ready.');

    await pool.query(createChatsTableQuery);
    console.log('chats table is ready.');

    await pool.query(createMessagesTableQuery);
    console.log('messages table is ready.');
    
    // 5. NAYA: Purani 'messages' table (agar hai) ko check karna aur naye columns add karna
    // Yeh code existing users ke liye hai jinke paas purani table ho sakti hai
    await pool.query("ALTER TABLE messages ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'text'");
    await pool.query("ALTER TABLE messages ADD COLUMN IF NOT EXISTS url TEXT");
    await pool.query("ALTER TABLE messages ADD COLUMN IF NOT EXISTS context TEXT");
    console.log('messages table columns are verified.');

  } catch (err) {
    console.error('--------------------------------------------------');
    console.error('FATAL: Table creation/alteration failed:');
    console.error(err.stack);
    console.error('--------------------------------------------------');
    process.exit(1);
  }
};

// 6. Pool aur initialize function dono ko export karein
module.exports = {
  query: (text, params) => pool.query(text, params),
  initializeDatabase,
};