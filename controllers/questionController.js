const Question = require("../models/questionSchema");

exports.createQuestion = async (req, res) => {
  try {
    const newQuestion = await Question.create(req.body);
    res.status(201).send(newQuestion);
  } catch (err) {
    console.error("Error creating question:", err.message);
    res.status(400).send(err.message);
  }
};

exports.getAllQuestion = async (req, res) => {
  try {
    const {
      year,
      shift,
      subject,
      difficulty,
      exam,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};
    if (year) {
      query.year = parseInt(year, 10);
    }
    if (shift) {
      query.shift = shift;
    }
    if (subject) {
      query.subject = subject;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (exam) {
      query.exam = exam;
    }

    const options = {
      skip: (page - 1) * parseInt(limit, 10),
      limit: parseInt(limit, 10),
    };

    const questions = await Question.find(query, null, options);
    const totalQuestions = await Question.countDocuments(query);

    if (questions.length === 0) {
      return res
        .status(404)
        .send("No questions found with the specified criteria.");
    }

    res.status(200).json({
      status: "success",
      length: questions.length,
      totalQuestions,
      totalPages: Math.ceil(totalQuestions / limit),
      currentPage: parseInt(page, 10),
      questions,
    });
  } catch (err) {
    console.error("Error fetching questions:", err.message);
    res.status(500).send("Server error. Please try again later.");
  }
};

exports.getQuestionById = async (req, res) => {
  const { id } = req.params;
  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).send("Question not found");
    }
    res.status(200).send(question);
  } catch (err) {
    console.error("Error fetching question by id:", err.message);
    res.status(500).send("An error occurred while fetching the question.");
  }
};

exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedQuestion = await Question.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedQuestion) {
      return res.status(404).json({
        status: "error",
        message: "Question not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedQuestion,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.deleteQuestionById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({
        status: "error",
        message: "Question not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Question deleted successfully",
      data: deletedQuestion,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
