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

const AnswerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedOption: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
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
});

module.exports = mongoose.model('User', UserSchema);
