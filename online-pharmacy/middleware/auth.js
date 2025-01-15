import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    console.log('Decoded Token:', decoded);
    req.user = decoded.user;
    // NOTE: The user ID is stored in req.user.id, NOT req.user._id
    // The decoded token structure is { user: { id: 'user_id', role: 'user' }, iat, exp }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export default authMiddleware;
