const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const db = require('../db.js');
const { protect } = require('../middleware/authMiddleware.js');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); 

// --- Folders ko setup karna ---
const pdfDir = path.join(__dirname, '..', 'uploads', 'pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// --- Gemini Model ko Initialize karein ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-09-2025",
  safetySettings
});

// --- Multer Setup (for PDF Uploads) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pdfDir); // Save to the '/uploads/pdfs' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'uploaded-' + uniqueSuffix + '.pdf');
  }
});
const upload = multer({ storage: storage });


// --- Helper Functions ---

// UPDATED to return the new message ID
const saveMessage = async (chatId, sender, text, type = 'text', url = null, context = null) => {
  const sql = `
    INSERT INTO messages (chatId, sender, text, type, url, context) 
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING messageId 
  `;
  const result = await db.query(sql, [chatId, sender, text, type, url, context]);
  return result.rows[0].messageid; 
};

const checkPositiveIntent = (text) => {
  const lowerCaseMessage = text.toLowerCase();
  const keywords = ['yes', 'sure', 'ok', 'please', 'generate', 'yep', 'okay', 'fine', 'haan'];
  return keywords.some(keyword => lowerCaseMessage.includes(keyword));
};
const checkGratitudeIntent = (text) => {
  const lowerCaseMessage = text.toLowerCase();
  const keywords = ['thank', 'thanks', 'shukriya', 'dhanyavaad', 'helpful', 'appreciate'];
  return keywords.some(keyword => lowerCaseMessage.includes(keyword));
};
const checkIntent = (text) => {
  const lowerCaseMessage = text.toLowerCase();
  const newsKeywords = ['news', 'latest', 'headlines', 'today', 'khabar'];
  if (newsKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
    return 'INTENT_NEWS';
  }
  return 'INTENT_CHAT';
};
const fetchNewsData = async () => {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) throw new Error("GNews API key not found.");
    const url = `https://gnews.io/api/v4/top-headlines?lang=en&country=in&max=5&apikey=${apiKey}`;
    const response = await axios.get(url);
    if (!response.data.articles || response.data.articles.length === 0) return [];
    return response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      source: article.source.name,
      content: article.content || article.description,
      url: article.url
    }));
  } catch (error) {
    console.error("GNews Error:", error.message);
    return null;
  }
};
const getNewsSummaryFromLLM = async (articles) => {
  if (!articles || articles.length === 0) {
    return "# No News Found\nI'm sorry, but I couldn't find any recent top headlines for India.";
  }
  const prompt = `
    You are a professional news analyst. A user asked for "top news in India".
    Here are the top 5 articles I found:
    ${JSON.stringify(articles, null, 2)}
    Please provide a very detailed, multi-page report. Format your response *exactly* like the example below, using markdown-style headers.
    For each article, you MUST write a 4-5 paragraph "Detailed Elaboration".
    # AI News Report: Top Headlines from India
    (Start with a brief, one-paragraph overview...)
    ## 1: ${articles[0]?.title || 'First Article'}
    (Source: ${articles[0]?.source || 'N/A'})
    #### Detailed Elaboration
    (Write 4-5 paragraphs here...)
    ## 2: ${articles[1]?.title || 'Second Article'}
    (Source: ${articles[1]?.source || 'N/A'})
    #### Detailed Elaboration
    (Write 4-5 paragraphs here...)
    (Continue for all 5 articles...)
  `;
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7 },
    systemInstruction: { parts: [{ text: "You are a helpful news analyst. Format your output as a detailed, multi-paragraph report." }] }
  });
  return result.response.text();
};
const generateNewsPdf = (summaryText, articles) => {
  return new Promise((resolve, reject) => {
    const fileName = `news_report_${Date.now()}.pdf`;
    const filePath = path.join(pdfDir, fileName);
    const publicUrl = `/uploads/pdfs/${fileName}`;
    const doc = new PDFDocument({ margin: 72, layout: 'portrait', size: 'A4' });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    const lines = summaryText.split('\n');
    let chapterTitles = [];
    let introduction = "";
    let mainTitle = "AI News Report";
    let foundIntro = false;
    let foundFirstChapter = false;
    lines.forEach(line => {
      if (line.startsWith('# ')) { mainTitle = line.substring(2).trim(); foundIntro = true; }
      else if (line.startsWith('## ')) { chapterTitles.push(line.substring(3).trim()); foundFirstChapter = true; }
      else if (foundIntro && !foundFirstChapter && line.trim().length > 0) { introduction += line + '\n'; }
    });
    doc.fontSize(28).font('Helvetica-Bold').text(mainTitle, { align: 'center' });
    doc.moveDown(15);
    doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });
    doc.addPage();
    doc.fontSize(20).font('Helvetica-Bold').text('Table of Contents', { align: 'left' });
    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica').text('Introduction', { goTo: 'intro', underline: false });
    doc.moveDown(1);
    chapterTitles.forEach((title, index) => {
      doc.fontSize(14).font('Helvetica').text(title, { goTo: `chap${index + 1}`, underline: false });
      doc.moveDown(0.5);
    });
    doc.addPage();
    doc.fontSize(18).font('Helvetica-Bold').text('Introduction');
    doc.addNamedDestination('intro');
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(introduction.trim(), { align: 'justify', lineGap: 5 });
    doc.moveDown();
    let chapterIndex = 0;
    lines.forEach(line => {
      if (line.startsWith('## ')) {
        chapterIndex++;
        doc.addPage();
        const title = line.substring(3).trim();
        doc.fontSize(20).font('Helvetica-Bold').text(title, { underline: true });
        doc.addNamedDestination(`chap${chapterIndex}`);
        doc.moveDown(1);
      } 
      else if (line.startsWith('### ')) {
        const subTitle = line.substring(4).trim();
        doc.fontSize(16).font('Helvetica-Bold').text(subTitle);
        doc.moveDown(0.2);
      }
      else if (line.startsWith('#### ')) {
        const subSubTitle = line.substring(5).trim();
        doc.fontSize(14).font('Helvetica-BoldOblique').text(subSubTitle);
        doc.moveDown(0.5);
      }
      else if (line.startsWith('* ')) {
        doc.fontSize(12).font('Helvetica').list([line.substring(2).trim()], {
          bulletRadius: 2, textIndent: 20,
        });
        doc.moveDown(0.5);
      }
      else if (line.startsWith('(Source:')) {
        const sourceText = line.substring(1, line.length - 1);
        doc.fontSize(10).font('Helvetica-Oblique').text(sourceText, { indent: 20 });
        doc.moveDown(1);
      }
      else if (!line.startsWith('# ') && line.trim().length > 0 && !chapterTitles.some(t => line.includes(t))) {
        doc.fontSize(12).font('Helvetica').text(line, {
          align: 'justify', lineGap: 5,
        });
        doc.moveDown(0.5);
      }
    });
    doc.end();
    writeStream.on('finish', () => { resolve({ publicUrl, summaryText }); });
    writeStream.on('error', (err) => { reject(err); });
  });
};

// --- UPDATED HELPER FUNCTION ---
const getLLMChatResponse = async (history) => {
  let geminiHistory = history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const lastMessage = geminiHistory.pop();
  if (!lastMessage) return "Hello! How can I help you?";

  const firstUserIndex = geminiHistory.findIndex(msg => msg.role === 'user');

  if (firstUserIndex > 0) {
    geminiHistory = geminiHistory.slice(firstUserIndex);
  } else if (firstUserIndex === -1 && geminiHistory.length > 0) {
    geminiHistory = [];
  }
  
  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(lastMessage.parts[0].text);
  return result.response.text();
};

// --- UPDATED HELPER FUNCTION ---
const getRAGResponse = async (history, context) => {
  const lastUserQuestion = history[history.length - 1].text;
  const prompt = `
    You are a helpful assistant. A user is asking questions about a specific news report or a user-uploaded PDF.
    Use the following context to answer the user's question.
    
    CONTEXT:
    ---
    ${context || 'No context available.'}
    ---
    
    USER'S QUESTION:
    ${lastUserQuestion}

    IMPORTANT:
    - If the user's question is *directly related* to the context, answer it using *only* the context.
    - If the context is 'No context available', politely state that you cannot answer questions about the PDF as its content could not be read.
    - If the user's question is a simple greeting, farewell, or polite message (like "hello", "thank you", "bye"), just respond politely as a normal AI assistant. Do NOT say "I'm sorry...".
    - If the question is *not* related to the context and is *not* a simple greeting, politely say "I'm sorry, that information is not in the provided document. We can only discuss the opened PDF."
  `;

  let geminiHistory = history.slice(0, -1).map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const firstUserIndex = geminiHistory.findIndex(msg => msg.role === 'user');

  if (firstUserIndex > 0) {
    geminiHistory = geminiHistory.slice(firstUserIndex);
  } else if (firstUserIndex === -1 && geminiHistory.length > 0) {
    geminiHistory = [];
  }
  
  const chat = model.startChat({
    history: geminiHistory,
    systemInstruction: { parts: [{ text: "You are an assistant answering questions about a specific context, but you can also handle simple polite conversation." }] }
  });
  
  const result = await chat.sendMessage(prompt);
  return result.response.text();
};


// --- (A) Guest Chat Route (Unchanged) ---
router.post('/chat/guest', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages) {
      return res.status(400).json({ message: 'Messages array is required.' });
    }
    const lastUserMessage = messages[messages.length - 1]?.text.toLowerCase() || '';
    const simpleKeywords = ['hello', 'hii', 'hey', 'bye', 'goodbye', 'thank', 'thanks'];
    const isSimpleMessage = simpleKeywords.some(keyword => lastUserMessage.includes(keyword));

    if (isSimpleMessage) {
      let aiText = "You're welcome! Please log in to access all features.";
      if (lastUserMessage.includes('hello') || lastUserMessage.includes('hii') || lastUserMessage.includes('hey')) {
        aiText = "Hello! To access my full capabilities, please log in or sign up.";
      } else if (lastUserMessage.includes('bye') || lastUserMessage.includes('goodbye')) {
        aiText = "Goodbye! Hope to see you again as a registered user.";
      }
      return res.json({ id: Date.now(), sender: 'ai', text: aiText, type: 'text' });
    } 
    
    return res.json({
      id: Date.now(),
      sender: 'ai',
      text: 'This feature is available for registered users. Please log in or create an account to continue.',
      type: 'login_required' 
    });
  } catch (error) {
    console.error('Guest Chat Error:', error);
    res.status(500).json({ message: 'Error communicating with LLM.' });
  }
});


// --- (B) PDF Generation Routes ---

// (Guest PDF route, unchanged)
router.post('/chat/generate-pdf/guest', async (req, res) => {
  try {
    res.status(403).json({
      id: Date.now(),
      sender: 'ai',
      text: 'This feature is available for registered users. Please log in to continue.',
      type: 'login_required'
    });
  } catch (error) {
    console.error('PDF Generation Error (Guest):', error);
    res.status(500).json({ message: 'Failed to generate PDF.' });
  }
});

// (Logged-in PDF route, UPDATED to return ID)
router.post('/chat/generate-pdf', protect, async (req, res) => {
  try {
    const { chatId } = req.body;
    const articles = await fetchNewsData();
    const summary = await getNewsSummaryFromLLM(articles);
    const { publicUrl, summaryText } = await generateNewsPdf(summary, articles);

    const pdfResponse = {
      sender: 'ai',
      text: 'Your detailed news report is ready! You can view it here.',
      type: 'pdf',
      url: publicUrl,
      context: summaryText
    };

    if (chatId) {
      const newId = await saveMessage(chatId, pdfResponse.sender, pdfResponse.text, pdfResponse.type, pdfResponse.url, pdfResponse.context);
      pdfResponse.id = newId;
    }
    
    res.status(200).json(pdfResponse);
  } catch (error) {
    console.error('PDF Generation Error (User):', error);
    res.status(500).json({ message: 'Failed to generate PDF.' });
  }
});


// --- (C) Logged-in User Chat Routes (Protected) ---

// (GET /api/chats, unchanged)
router.get('/chats', protect, async (req, res) => {
  try {
    const sql = `SELECT chatId, title FROM chats WHERE userId = $1 ORDER BY createdAt DESC`;
    const result = await db.query(sql, [req.userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get Chats Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// (GET /api/chat/:chatId, UPDATED to return ID)
router.get('/chat/:chatId', protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chatCheckSql = `SELECT * FROM chats WHERE chatId = $1 AND userId = $2`;
    const chatCheck = await db.query(chatCheckSql, [chatId, req.userId]);
    if (chatCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const messagesSql = `
      SELECT messageId, sender, text, type, url, context 
      FROM messages 
      WHERE chatId = $1 
      ORDER BY createdAt ASC
    `;
    const messagesResult = await db.query(messagesSql, [chatId]);

    res.status(200).json(messagesResult.rows.map(row => ({
      id: row.messageid,
      sender: row.sender,
      text: row.text,
      type: row.type,
      url: row.url,
      context: row.context
    })));
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// (POST /api/chat/new, UPDATED to return IDs)
router.post('/chat/new', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    const newChatSql = `INSERT INTO chats (userId, title) VALUES ($1, $2) RETURNING chatId`;
    const title = message.substring(0, 40) + '...';
    const newChat = await db.query(newChatSql, [userId, title]);
    const chatId = newChat.rows[0].chatid;

    const userMessageId = await saveMessage(chatId, 'user', message);
    
    let aiResponse;
    let messagesForFrontend = [{ id: userMessageId, sender: 'user', text: message }];

    if (checkIntent(message) === 'INTENT_NEWS') {
      aiResponse = {
        sender: 'ai',
        text: "There's so much news! I can generate a detailed PDF report for you. Shall I proceed?",
        type: 'pdf_prompt'
      };
    } else {
      const history = [{ sender: 'user', text: message }];
      const text = await getLLMChatResponse(history);
      aiResponse = { sender: 'ai', text: text, type: 'text' };
    }

    const aiMessageId = await saveMessage(chatId, aiResponse.sender, aiResponse.text, aiResponse.type);
    aiResponse.id = aiMessageId; 
    messagesForFrontend.push(aiResponse);

    res.status(201).json({ 
      chatId, 
      messages: messagesForFrontend 
    });
  } catch (error) {
    console.error('New Chat Error:', error);
    // --- THIS IS THE FIXED LINE ---
    res.status(500).json({ message: 'Server error' });
  }
});


// (POST /api/chat/:chatId, UPDATED to return ID)
router.post('/chat/:chatId', protect, async (req, res) => {
  try {
    const { message, history, pdfContext } = req.body;
    const { chatId } = req.params;

    const chatCheckSql = `SELECT * FROM chats WHERE chatId = $1 AND userId = $2`;
    const chatCheck = await db.query(chatCheckSql, [chatId, req.userId]);
    if (chatCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await saveMessage(chatId, 'user', message);
    
    let aiResponse;
    const fullHistory = history.concat({sender: 'user', text: message});

    if (pdfContext && checkGratitudeIntent(message)) {
      aiResponse = {
        sender: 'ai',
        text: "You're welcome! Shall I close the PDF preview now?",
        type: 'pdf_close_prompt'
      };
    }
    else if (history.length > 0 && history[history.length - 1].type === 'pdf_close_prompt') {
      if (checkPositiveIntent(message)) {
        aiResponse = { sender: 'ai', text: 'Okay, closing the preview. The context is now cleared.', type: 'pdf_close' };
      } else {
        aiResponse = { sender: 'ai', text: 'No problem! We can keep discussing the report.', type: 'text' };
      }
    }
    else if (pdfContext) { 
      const text = await getRAGResponse(fullHistory, pdfContext);
      aiResponse = { sender: 'ai', text: text, type: 'text', url: null, context: null };
    }
    else if (history.length > 0 && history[history.length - 1].type === 'pdf_prompt') {
      if (checkPositiveIntent(message)) {
        aiResponse = {
          sender: 'ai',
          text: 'Great! I will start generating the report. Please wait...',
          type: 'pdf_loading'
        };
      } else {
        aiResponse = { sender: 'ai', text: 'Okay, no problem. What else can I help you with?', type: 'text' };
      }
    }
    else if (checkIntent(message) === 'INTENT_NEWS') {
      aiResponse = {
        sender: 'ai',
        text: "There's so much news! I can generate a detailed PDF report for you. Shall I proceed?",
        type: 'pdf_prompt'
      };
    }
    else {
      const text = await getLLMChatResponse(fullHistory);
      aiResponse = { sender: 'ai', text: text, type: 'text', url: null, context: null };
    }
    
    const aiMessageId = await saveMessage(
      chatId, 
      aiResponse.sender, 
      aiResponse.text, 
      aiResponse.type, 
      aiResponse.url, 
      aiResponse.context
    );
    
    aiResponse.id = aiMessageId; 
    
    res.status(200).json(aiResponse);

  } catch (error) {
    console.error('Existing Chat Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- NEW ROUTE: DELETE /api/chat/:chatId ---
router.delete('/chat/:chatId', protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chatCheckSql = `SELECT * FROM chats WHERE chatId = $1 AND userId = $2`;
    const chatCheck = await db.query(chatCheckSql, [chatId, userId]);
    
    if (chatCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete messages first
    const deleteMessagesSql = `DELETE FROM messages WHERE chatId = $1`;
    await db.query(deleteMessagesSql, [chatId]);
    
    // Delete the chat itself
    const deleteChatSql = `DELETE FROM chats WHERE chatId = $1`;
    await db.query(deleteChatSql, [chatId]);

    res.status(200).json({ message: 'Chat deleted successfully' });

  } catch (error) {
    console.error('Delete Chat Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- NEW ROUTE: POST /api/upload/pdf (pdf-parse removed) ---
router.post('/upload/pdf', protect, upload.single('userPdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const userId = req.userId;
    let { chatId } = req.body; 

    const publicUrl = `/uploads/pdfs/${req.file.filename}`;

    // PDF PARSING REMOVED
    const pdfContent = null; 
    const aiMessageText = `PDF Uploaded: ${req.file.originalname}. Here is the preview.`;

    if (!chatId) {
      // Create new chat
      const newChatSql = `INSERT INTO chats (userId, title) VALUES ($1, $2) RETURNING chatId`;
      const title = req.file.originalname.substring(0, 40) + '...';
      const newChat = await db.query(newChatSql, [userId, title]);
      chatId = newChat.rows[0].chatid;
      
      const aiMessageId = await saveMessage(
        chatId, 'ai', aiMessageText, 'pdf', publicUrl, pdfContent
      );
      
      res.status(201).json({
        chatId: chatId,
        messages: [{
          id: aiMessageId,
          sender: 'ai',
          text: aiMessageText,
          type: 'pdf',
          url: publicUrl,
          context: pdfContent
        }]
      });

    } else {
      // Add PDF to existing chat
      const aiMessageId = await saveMessage(
        chatId, 'ai', aiMessageText, 'pdf', publicUrl, pdfContent
      );
      
      res.status(201).json({
        id: aiMessageId,
        sender: 'ai',
        text: aiMessageText,
        type: 'pdf',
        url: publicUrl,
        context: pdfContent
      });
    }

  } catch (error) {
    console.error('PDF Upload Error:', error); 
    res.status(500).json({ message: 'Error processing PDF file.' });
  }
});


module.exports = router;