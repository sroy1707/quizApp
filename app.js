// const express = require("express");
// const app = express();
// const port = 3000;

// app.use(express.json());

// mongoose
//   .connect("mongodb://localhost:27017/quiz", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("Could not connect to MongoDB...", err));

// const createQuestion = async () => {
//   const question = new Question({
//     question: "What is the capital of France?",
//     options: ["Berlin", "Madrid", "Paris", "Rome"],
//     correctAnswer: "Paris",
//     year: 2024,
//     shift: "Shift 1",
//     tag: "Geography",
//     difficulty: "Easy",
//     subject: "General Knowledge",
//     topics: ["Capital Cities", "Europe"],
//   });

//   try {
//     const result = await question.save();
//     console.log("Question created:", result);
//   } catch (err) {
//     console.error("Error creating question:", err.message);
//   }
// };

// createQuestion();

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

const express = require("express");
const mongoose = require("mongoose");
const Question = require("./models/questionSchema");

const app = express();
const port = 3000;

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/quiz", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Route to create a new question
app.post("/questions", async (req, res) => {
  try {
    const newQuestion = await Question.create(req.body);
    res.status(201).send(newQuestion);
  } catch (err) {
    console.error("Error creating question:", err.message);
    res.status(400).send(err.message);
  }
});

// app.get("/questions", async (req, res) => {
//   try {
//     const questions = await Question.find();
//     res.status(200).send(questions);
//   } catch (err) {
//     console.error("Error fetching questions:", err.message);
//     res.status(500).send("An error occurred while fetching questions.");
//   }
// });

app.get("/questions", async (req, res) => {
  try {
    const { year, shift, subject, difficulty } = req.query;

    // Build the query object dynamically based on provided parameters
    let query = {};

    if (year) {
      query.year = parseInt(year, 10); // Convert the year to an integer
    }
    if (shift) {
      query.shift = shift; // Assumes shift is a string
    }
    if (subject) {
      query.subject = subject; // Assumes subject is a string
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Fetch questions from the database based on the query object
    const questions = await Question.find(query);

    if (questions.length === 0) {
      return res
        .status(404)
        .send("No questions found with the specified criteria.");
    }

    res.status(200).send(questions);
  } catch (err) {
    console.error("Error fetching questions:", err.message);
    res.status(500).send("Server error. Please try again later.");
  }
});

app.get("/questions/:id", async (req, res) => {
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
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
