const Quiz = require("../models/quizSchema");
const Question = require("../models/questionSchema");

exports.createQuiz = async (req, res) => {
  try {
    const {
      title,
      instructions,
      time,
      no_of_sections,
      language,
      totalAttempts,
      correctMarks,
      incorrectMarks,
      sections,
    } = req.body;

    // Validate and populate sections with actual question data
    const populatedSections = await Promise.all(
      sections.map(async (section) => {
        const populatedSubSections = await Promise.all(
          section.subSections.map(async (subSection) => {
            // Ensure all provided question IDs are valid MongoDB ObjectIDs
            if (
              !subSection.questions.every((qId) =>
                mongoose.Types.ObjectId.isValid(qId)
              )
            ) {
              throw new Error("Invalid question ID");
            }

            // Fetch the questions from the database
            const selectedQuestions = await Question.find({
              _id: { $in: subSection.questions },
            });

            // Check if all questions were found
            if (selectedQuestions.length !== subSection.questions.length) {
              throw new Error("Some questions were not found");
            }

            return { ...subSection, questions: selectedQuestions };
          })
        );
        return { ...section, subSections: populatedSubSections };
      })
    );

    const newQuiz = new Quiz({
      title,
      instructions,
      time,
      no_of_sections,
      language,
      totalAttempts,
      correctMarks,
      incorrectMarks,
      sections: populatedSections,
    });

    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    res
      .status(500)
      .json({ error: "Error creating quiz", details: error.message });
  }
};

exports.getAllQuiz = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ active: true }).select(
      "-sections -correctMarks -incorrectMarks -instructions -no_of_sections"
    );

    res.status(200).json({ success: true, length: quizzes.length, quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res
      .status(500)
      .json({ error: "Error fetching quizzes", details: error.message });
  }
};

exports.getQuizById = async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await Quiz.findById(id).populate({
      path: "sections.subSections.questions",
      model: "Question",
    });

    if (!quiz) {
      return res.status(404).send("Quiz not found");
    }

    res.status(200).json(quiz);
  } catch (err) {
    console.error("Error fetching quiz by id:", err.message);
    res.status(500).send("An error occurred while fetching the quiz.");
  }
};

exports.updateQuiz = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedQuiz) {
      return res.status(404).send("Quiz not found");
    }

    res.status(200).json(updatedQuiz);
  } catch (err) {
    console.error("Error updating quiz:", err.message);
    res.status(500).send("An error occurred while updating the quiz.");
  }
};

exports.deleteQuizById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(id);

    if (!deletedQuiz) {
      return res.status(404).send("Quiz not found");
    }

    res.status(200).send("Quiz deleted successfully");
  } catch (err) {
    console.error("Error deleting quiz:", err.message);
    res.status(500).send("An error occurred while deleting the quiz.");
  }
};
