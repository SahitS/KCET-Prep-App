const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const router = express.Router();

const ChemistryCollection = mongoose.connection.collection('Previous_Year_Questions_Chemistry');
const PhysicsCollection = mongoose.connection.collection('Previous_Year_Questions_Physics');
const MathematicsCollection = mongoose.connection.collection('Previous_Year_Questions_Mathematics');

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

  try {
    const userToken = req.headers.authorization;

    if (!userToken) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    // Fetch the user document
    const user = await User.findOne({ token: userToken });

    if (!user) {
      console.error('User not found for token:', token);
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only the answers field
    const { physicsAnswers, chemistryAnswers, mathAnswers } = answers;

    user.answers.physicsAnswers = physicsAnswers;
    user.answers.chemistryAnswers = chemistryAnswers;
    user.answers.mathAnswers = mathAnswers;

    console.log('Saving answers:', user.answers);

    // Save only the `answers` field
    await User.updateOne(
      { token: userToken },
      { $set: { answers: user.answers } }
    );

    return res.status(200).json({ message: 'Answers saved successfully' });
  } catch (error) {
    console.error('Error occurred while saving answers:', error);
    return res.status(500).json({ message: 'An error occurred while saving answers' });
  }
});

// Endpoint to get quiz results
router.get('/get-results', async (req, res) => {
  try {
    // Retrieve the token from the request headers
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    // Find the user by token
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate scores for each subject
    const calculateScore = (answers) =>
      answers.reduce((score, answer) => (answer.isCorrect ? score + 1 : score), 0);

    const physicsScore = calculateScore(user.answers.physicsAnswers || []);
    const chemistryScore = calculateScore(user.answers.chemistryAnswers || []);
    const mathScore = calculateScore(user.answers.mathAnswers || []);

    return res.status(200).json({
      physics: physicsScore,
      chemistry: chemistryScore,
      math: mathScore,
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return res.status(500).json({ error: 'An error occurred while fetching results' });
  }
});

// Endpoint to get detailed results for a subject
router.get('/get-detailed-results/:subject', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const subject = req.params.subject.toLowerCase();

    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    // Validate user
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!['physics', 'chemistry', 'math'].includes(subject)) {
      return res.status(400).json({ error: 'Invalid subject' });
    }

    // Fetch questions and answers
    const quizQuestions = user.quiz[subject]; 
    const userAnswers = user.answers[`${subject}Answers`] || []; 

    // Map questions with answers
    const detailedResults = quizQuestions.map((question) => {
      const userAnswer = userAnswers.find((answer) => answer.questionIndex === question.questionIndex);

      return {
        question: question.Question,
        correctAnswer: question[question.Correct_Option],
        userAnswer: userAnswer ? question[userAnswer.selectedOption] : 'Not Answered',
        status: userAnswer
          ? userAnswer.isCorrect
            ? 'Correct'
            : 'Incorrect'
          : 'Not Answered',
      };
    });

    return res.status(200).json(detailedResults);
  } catch (error) {
    console.error('Error fetching detailed results:', error);
    return res.status(500).json({ error: 'An error occurred while fetching detailed results' });
  }
});

// Endpoint to get topic-wise and subtopic-wise analysis
router.get('/get-analysis', async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const analysis = {};
    const subjects = ['physics', 'chemistry', 'math'];

    for (const subject of subjects) {
      const questions = user.quiz[subject]; // All questions in the subject
      const userAnswers = user.answers[`${subject}Answers`] || []; // User's answers for the subject

      const topicData = {}; // Store analysis for each topic in this subject
      for (const question of questions) {
        const { Topic, Subtopic, questionIndex } = question;

        if (!topicData[Topic]) {
          topicData[Topic] = { total: 0, correct: 0, subtopics: {} };
        }

        if (!topicData[Topic].subtopics[Subtopic]) {
          topicData[Topic].subtopics[Subtopic] = { total: 0, correct: 0 };
        }

        topicData[Topic].total++;
        topicData[Topic].subtopics[Subtopic].total++;

        const userAnswer = userAnswers.find((answer) => answer.questionIndex === questionIndex);
        if (userAnswer && userAnswer.isCorrect) {
          topicData[Topic].correct++;
          topicData[Topic].subtopics[Subtopic].correct++;
        }
      }
      analysis[subject] = topicData;
    }

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'An error occurred while fetching analysis' });
  }
});

// Endpoint to fetch custom practice test
router.get('/get-custom-practice', async (req, res) => {
  try {
    console.log('Request received at /get-custom-practice'); // Log endpoint hit

    const token = req.headers.authorization; // Authorization token
    if (!token) {
      console.error('Authorization token is missing'); // Log missing token
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    console.log(`Token received: ${token}`); // Log the token

    // Fetch user from the database
    const user = await User.findOne({ token });
    if (!user) {
      console.error('User not found for the provided token'); // Log user not found
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', user.username); // Log the username of the user

    // Get custom practice questions
    const customPractice = user.custom_practice || [];
    console.log('Custom Practice Questions Retrieved:', customPractice); // Log retrieved questions

    // Check if custom practice questions exist
    if (!customPractice || customPractice.length === 0) {
      console.warn('No custom practice questions found'); // Log no questions found
      return res.status(404).json({
        message: 'No questions found for the selected filters.',
      });
    }

    console.log('Sending custom practice questions to the frontend'); // Log before sending response
    res.status(200).json({ questions: customPractice }); // Return as JSON
  } catch (error) {
    console.error('Error fetching custom practice test:', error); // Log errors
    res.status(500).json({
      error: 'An error occurred while fetching custom practice test',
    });
  }
});

//Endpoint to verifying custom practice questions on the go
router.post('/verify-answer', async (req, res) => {
  try {
    const { questionIndex, selectedOption } = req.body;
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const question = user.custom_practice.find(q => q.questionIndex === questionIndex);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const isCorrect = question.Correct_Option === selectedOption;
    res.status(200).json({ isCorrect });
  } catch (error) {
    console.error('Error verifying answer:', error);
    res.status(500).json({ error: 'An error occurred while verifying answer' });
  }
});

//Endpoint to save a custom practice sessions history
router.post('/save-session-history', async (req, res) => {
  try {
    const { token, performanceData } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Append performance data directly using $push
    const formattedData = performanceData.map(entry => ({
      subject: entry.subject || "Unknown Subject", // Default to "Unknown Subject" if missing
      topic: entry.topic,
      subtopic: entry.subtopic,
      totalQuestions: entry.totalQuestions,
      correctAnswers: entry.correctAnswers,
      accuracy: entry.accuracy,
    }));    

    await User.updateOne(
      { token },
      { $push: { history: { $each: formattedData } } }
    );

    res.status(200).json({ message: 'Performance history updated successfully' });
  } catch (error) {
    console.error('Error saving session history:', error);
    res.status(500).json({ error: 'An error occurred while saving session history' });
  }
});

//Endpoint to fetch the history
router.get('/get-history', async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Use MongoDB aggregation to create the hierarchy
    const historyHierarchy = await User.aggregate([
      { $match: { token } },
      { $unwind: "$history" },
      {
        $group: {
          _id: {
            subject: "$history.subject",
            topic: "$history.topic",
            subtopic: "$history.subtopic",
          },
          accuracy: { $avg: "$history.accuracy" },
        },
      },
      {
        $group: {
          _id: { subject: "$_id.subject", topic: "$_id.topic" },
          subtopics: {
            $push: { subtopic: "$_id.subtopic", accuracy: "$accuracy" },
          },
          topicAccuracy: { $avg: "$accuracy" },
        },
      },
      {
        $group: {
          _id: "$_id.subject",
          topics: {
            $push: {
              topic: "$_id.topic",
              accuracy: "$topicAccuracy",
              subtopics: "$subtopics",
            },
          },
          subjectAccuracy: { $avg: "$topicAccuracy" },
        },
      },
      {
        $project: {
          _id: 0,
          subject: "$_id",
          accuracy: "$subjectAccuracy",
          topics: 1,
        },
      },
    ]);

    res.status(200).json(historyHierarchy);
  } catch (error) {
    console.error('Error fetching hierarchical history:', error);
    res.status(500).json({ error: 'An error occurred while fetching history' });
  }
});

// Endpoint to fetch all questions
router.get('/fetch-quiz', async (req, res) => {
  try {
    const chemistryQuestions = await ChemistryCollection.find().toArray();
    const physicsQuestions = await PhysicsCollection.find().toArray();
    const mathematicsQuestions = await MathematicsCollection.find().toArray();

    if (!chemistryQuestions || !physicsQuestions || !mathematicsQuestions) {
      return res
        .status(500)
        .json({ error: 'One or more collections are empty' });
    }

    res.status(200).json({
      chemistry: chemistryQuestions,
      physics: physicsQuestions,
      mathematics: mathematicsQuestions,
    });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({ error: 'Failed to fetch quiz questions' });
  }
});

//endpoint to save total marks of mock-test
router.post('/submit-mock-test', async (req, res) => {
  const { token, physicsAnswers = [], chemistryAnswers = [], mathAnswers = [] } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let physicsScore = 0;
    let chemistryScore = 0;
    let mathScore = 0;

    console.log('Validating Physics answers:', physicsAnswers);
    for (const answer of physicsAnswers) {
      const question = await PhysicsCollection.findOne({ questionIndex: answer.questionIndex });
      if (question && question.correctAnswer === answer.selectedOption) {
        physicsScore++;
      }
    }

    console.log('Validating Chemistry answers:', chemistryAnswers);
    for (const answer of chemistryAnswers) {
      const question = await ChemistryCollection.findOne({ questionIndex: answer.questionIndex });
      if (question && question.correctAnswer === answer.selectedOption) {
        chemistryScore++;
      }
    }

    console.log('Validating Math answers:', mathAnswers);
    for (const answer of mathAnswers) {
      const question = await MathematicsCollection.findOne({ questionIndex: answer.questionIndex });
      if (question && question.correctAnswer === answer.selectedOption) {
        mathScore++;
      }
    }

    const totalScore = physicsScore + chemistryScore + mathScore;

    // Overwrite the user's mock test scores with a single object
    user.mockTestScores = [
      {
        date: new Date(),
        physicsScore,
        chemistryScore,
        mathScore,
        totalScore,
      },
    ];

    // Skip `custom_practice` validation if it's not relevant
    delete user.custom_practice;

    // Save user data without validating unrelated fields
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      message: 'Mock test submitted successfully!',
      scores: {
        physics: physicsScore,
        chemistry: chemistryScore,
        math: mathScore,
        total: totalScore,
      },
    });
  } catch (error) {
    console.error('Error submitting mock test:', error);
    res.status(500).json({ error: 'Failed to submit mock test' });
  }
});


module.exports = router;
