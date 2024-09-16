import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';
import upload from '../middleware/uploadMiddleware.js';
import { Types } from 'mongoose';

const { ObjectId } = Types;

const router = express.Router();

// Register a user
router.post('/register', async (req, res) => {
  const { firstName, lastName, userName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Check if the username already exists
    user = await User.findOne({ userName });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'Username already taken' }] });
    }
  
  user = new User({
    firstName,
    lastName,
    userName,
    email,
    password,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  await user.save();

  const payload = {
    user: {
      id: user.id,
    },
  };

  jwt.sign(
    payload,
    'your_jwt_secret',
    { expiresIn: 360000 },
    (err, token) => {
      if (err) throw err;
      res.json({ msg: 'Account successfully created', token });
    }
  );

  console.log('Account created');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Authenticate user & get token for only email logins
/**router.post('/login', async (req, res) => {
  const {email, password} = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      'your_jwt_secret',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}); **/

//login for username or email
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    // Find user by either email or username
    let user = await User.findOne({
      $or: [{ email: emailOrUsername }, { userName: emailOrUsername }]
    });

    // If no user is found
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    // Create a JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the JWT and return it
    jwt.sign(
      payload,
      'your_jwt_secret', // In production, use an environment variable for the secret
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
})

// Get logged in user
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//update a user details
router.put('/', authMiddleware, async (req, res) => {
  const { firstName, lastName, userName, email, password } = req.body;
  const userFields = {};
  if (firstName) userFields.firstName = firstName;
  if (lastName) userFields.lastName = lastName;
  if (email) userFields.email = email;
  if (userName) userFields.userName = userName;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    userFields.password = await bcrypt.hash(password, salt);
  }
  if (profilePicture) userFields.profilePicture = profilePicture;
  
  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    );
    res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
});

// Delete user account
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('User ID from token:', userId);
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    console.log('User found in database:', user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    await User.deleteOne({ _id: userId });
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all users (admin only)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Upload user profile picture
router.post('/upload-profile-picture', authMiddleware, upload, async (req, res) => {
  console.log('Starting file upload logic');
  try {
    // Get the file from multer
    const profilePicture = req.file;

    // Find user and update profile picture
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    // Update the profile picture URL
    user.profilePicture = profilePicture.path; 
    await user.save();

    res.json({ msg: 'Profile picture uploaded successfully', imageUrl: profilePicture.path });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


export default router;
