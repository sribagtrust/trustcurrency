// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Get the token from the request header
  const token = req.header('x-auth-token');

  // 2. Check if no token exists
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied. Please log in.' });
  }

  // 3. Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the user payload from the token to the request object
    req.user = decoded.user;
    
    // Move on to the next piece of code
    next();
  } catch (err) {
    console.error('JWT ERROR REASON:', err.message);
    res.status(401).json({ message: 'Token is not valid or has expired.' });
  }
};