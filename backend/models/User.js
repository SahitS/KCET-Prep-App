const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  Question: { type: String, required: true },
  Option_1: { type: String, required: true },
  Option_2: { type: String, required: true },
  Option_3: { type: String, required: true },
  Option_4: { type: String, required: true },
  Correct_Option: { type: String, required: true },
  Topic: { type: String, required: true },
  Subtopic: { type: String, required: true },
  Difficulty_Level: { type: String, required: true },
});

const QuizSchema = new mongoose.Schema({
  math: [QuestionSchema], // Array of Math questions
  chemistry: [QuestionSchema], // Array of Chemistry questions
  physics: [QuestionSchema], // Array of Physics questions
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String },
  quiz: QuizSchema,
});

module.exports = mongoose.model('User', UserSchema);
