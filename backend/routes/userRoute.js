const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken'); // 1. JWT ko import karein
const db = require('../db.js'); // db.js se connection import karein
const { protect } = require('../middleware/authMiddleware.js'); // 1. Naya middleware import karein

// --- Multer (File Upload) Setup ---
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 2. Token generate karne ke liye ek helper function
// Yeh function .env file se secret key lega
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d' // Token 1 din ke liye valid rahega
  });
};

// --- API Routes ---

// 1. Sign Up Route (POST /api/register)
router.post('/register', upload.single('userPhoto'), async (req, res) => {
  try {
    const { userName, email, userPass } = req.body;
    const userPhoto = req.file ? `/uploads/${req.file.filename}` : null;

    if (!userName || !email || !userPass) {
      return res.status(400).json({ message: 'All fields (userName, email, userPass) are required.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPass, salt);

    const sql = `
      INSERT INTO userInfo (userName, email, userPass, userPhoto) 
      VALUES ($1, $2, $3, $4) 
      RETURNING userId
    `;
    const params = [userName, email, hashedPassword, userPhoto];
    const result = await db.query(sql, params);

    const userId = result.rows[0].userId;

    // 3. Register hone par token generate karein
    const token = generateToken(userId);

    res.status(201).json({ 
      message: 'User registered successfully!', 
      userId: userId,
      token: token // Token ko response mein bhejein
    });

  } catch (error) {
    console.error('Registration Error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email already exists.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

// 2. Login Route (POST /api/login)
router.post('/login', async (req, res) => {
  try {
    const { email, userPass } = req.body;

    // --- Validation ---
    if (!email || !userPass) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // --- User ko Find karein ---
    const sql = `SELECT * FROM userInfo WHERE email = $1`;
    const result = await db.query(sql, [email]);

    if (result.rows.length === 0) {
      // User nahi mila
      return res.status(404).json({ message: 'User not found. Please check your email.' });
    }

    const user = result.rows[0];

    // --- Password Compare karein ---
    const isMatch = await bcrypt.compare(userPass, user.userpass); // 'userpass' (lowercase) Postgres standard

    if (!isMatch) {
      // Password galat hai
      return res.status(401).json({ message: 'Invalid credentials. Please check your password.' });
    }

    // 4. Login hone par token generate karein
    const token = generateToken(user.userid);

    // --- Success Response ---
    res.status(200).json({
      message: 'Login successful!',
      token: token, // Token ko response mein bhejein
      user: {
        userId: user.userid,
        userName: user.username,
        email: user.email,
        userPhoto: user.userphoto
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/photo', protect, upload.single('userPhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // 5. Naya path (relative)
    const userPhotoPath = `/uploads/${req.file.filename}`;
    const userId = req.userId; // 'protect' middleware se

    // 6. Database ko update karein
    const sql = `
      UPDATE userInfo 
      SET userPhoto = $1 
      WHERE userId = $2 
      RETURNING *
    `;
    const result = await db.query(sql, [userPhotoPath, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 7. Naya user object frontend ko waapas bhejein
    const updatedUser = result.rows[0];
    res.status(200).json({
      message: 'Photo updated successfully!',
      user: {
        userId: updatedUser.userid,
        userName: updatedUser.username,
        email: updatedUser.email,
        userPhoto: updatedUser.userphoto
      }
    });

  } catch (error) {
    console.error('Photo Upload Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;

