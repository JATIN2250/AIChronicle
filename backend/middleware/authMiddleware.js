const jwt = require('jsonwebtoken');
const db = require('../db'); // Hum DB ko import kar rahe hain (optional, but good practice)

// Middleware to verify JWT token
const protect = async (req, res, next) => {
  let token;
  
  // Check for token in the 'Authorization' header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user's ID (from the token payload) to the request object
      // This makes req.userId available in all protected routes
      // Hum database se check kar sakte hain ki user abhi bhi exist karta hai ya nahi,
      // lekin abhi ke liye hum token par bharosa karenge.
      req.userId = decoded.id;
      
      next(); // Proceed to the route handler
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };