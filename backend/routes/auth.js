const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiter for login route
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50000, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts. Please try again later.',
});

// Signup Route
router.post(
  '/signup',
  [
    body('username').isAlphanumeric().withMessage('Username must be alphanumeric').trim(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/\d/).withMessage('Password must contain at least one number')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      // Check if the username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      
      // Set the token field to the MongoDB `_id`
      newUser.token = newUser._id.toString();
      
      await newUser.save();
      res.status(201).json({ message: 'User created' });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  }
);

// Login Route
router.post(
  '/login',
  loginLimiter,
  [
    body('username').notEmpty().withMessage('Username is required').trim(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      let token = user.token || user._id.toString();

      if (!user.token) {
        user.token = token;
        await user.save();
      }
      
      console.log("Generated Token:", token);

      // Return the `token` (MongoDB `_id`) to the client
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Login error' });
    }
  }
);

// Endpoint to save quiz answers
router.post('/submit-answers', async (req, res) => {
  console.log('Request received at /submit-answers');
  console.log('Request body:', req.body);

  const { token, answers } = req.body;

  
  console.log('Payload received:', {
    token,
    answers,
  });

  try {
    
    const user = await User.findOne({ token });

    if (!user) {
      console.error('User not found for token:', token); 
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.username); 

    
    user.answers = answers;

    console.log('Answers being saved:', answers); 

    await user.save();

    console.log('Answers saved successfully for user:', user.username); 
    return res.status(200).json({ message: 'Answers saved successfully' });
  } catch (error) {
    console.error('Error occurred while saving answers:', error); 
    return res.status(500).json({ message: 'An error occurred while saving answers' });
  }
});



module.exports = router;
