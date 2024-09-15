const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  incorrectAnswers: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number, // in seconds
    required: true,
  },
  attempts: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ["pass", "fail"],
    required: true,
  },
  sections: [
    {
      sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      correctAnswers: {
        type: Number,
        required: true,
      },
      incorrectAnswers: {
        type: Number,
        required: true,
      },
      subsections: [
        {
          subsectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subsection",
            required: true,
          },
          score: {
            type: Number,
            required: true,
          },
          correctAnswers: {
            type: Number,
            required: true,
          },
          incorrectAnswers: {
            type: Number,
            required: true,
          },
          questions: [
            {
              questionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question",
                required: true,
              },
              attempted: {
                type: Boolean,
                default: false,
              },
              selectedOption: {
                type: String,
                default: null, // null if not attempted
              },
              correct: {
                type: Boolean,
                default: false,
              },
            },
          ],
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

resultSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Result", resultSchema);
