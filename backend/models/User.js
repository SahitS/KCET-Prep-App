const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
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

const AnswerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedOption: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const HistorySchema = new mongoose.Schema({
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  subtopic: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const QuizSchema = new mongoose.Schema({
  math: [QuestionSchema], 
  chemistry: [QuestionSchema], 
  physics: [QuestionSchema],
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String },
  quiz: QuizSchema,
  answers: {
    physicsAnswers: [AnswerSchema],
    chemistryAnswers: [AnswerSchema],
    mathAnswers: [AnswerSchema],
  },
  custom_practice: [QuestionSchema],
  history: [HistorySchema],
});

module.exports = mongoose.model('User', UserSchema);
