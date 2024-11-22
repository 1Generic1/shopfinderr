const adminMiddleware = (req, res, next) => {
  // Decode the token to get user info
  const token = req.header('x-auth-token'); // Assuming you're sending the token in the header
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded.user;

    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admins only' });
    }

    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Use this middleware in a protected route
app.get('/admin', adminMiddleware, (req, res) => {
  res.json({ msg: 'Welcome Admin!' });
});

