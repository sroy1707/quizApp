const mongoose = require("mongoose");

const SubSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
  ],
});

const SectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subSections: [SubSectionSchema],
});

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
  },
  time: {
    type: Number,
    required: true,
  },
  no_of_sections: {
    type: Number,
    required: true,
  },
  sections: [SectionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  language: {
    type: String,
    enum: ["eng", "hin", "all"],
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  totalAttempts: {
    type: Number,
    required: true,
  },
  correctMarks: {
    type: Number,
    required: true,
  },
  incorrectMarks: {
    type: Number,
    required: true,
  },
});

const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;
