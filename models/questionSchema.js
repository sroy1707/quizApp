const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.length === 4;
      },
      message: (props) => `${props.value} must contain exactly four options!`,
    },
  },
  correctAnswer: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return this.options.includes(v);
      },
      message: (props) => `${props.value} is not one of the options provided!`,
    },
  },
  year: {
    type: Number,
    enum: [2024, 2023, 2022, 2021, 2020, 2019],
    required: true,
  },
  shift: {
    type: Number,
    enum: [1, 2, 3, 4],
    required: true,
  },
  tier: {
    type: Number,
    enum: [1, 2],
    required: true,
  },
  tag: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  exam: {
    type: String,
    enum: ["CGL", "CHSL", "MTS", "CPO", "STENO", "Selection Post"],
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  topics: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

questionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
