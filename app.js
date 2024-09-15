const admin = require("firebase-admin");
const serviceAccount = require("./firebaseAdmin.json");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;
app.use(express.json());
const multer = require("multer");
const sharp = require("sharp");
const questionRouter = require("./routes/questionRoutes");
const userRouter = require("./routes/userRoutes");
const quizRouter = require("./routes/quizRoutes");
const Image = require("./models/imageSchema");
const Question = require("./models/questionSchema");
const User = require("./models/userSchema");
const Quiz = require("./models/quizSchema");
const Result = require("./models/resultSchema");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

mongoose
  .connect(process.env.LOCAL_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Routes
app.use("/api/v1/questions", questionRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/quiz", quizRouter);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.BUCKET_ID,
});

const bucket = admin.storage().bucket();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("image");

app.post("/api/v1/upload", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ message: err });
    }

    if (!req.file) {
      return res.status(400).send({ message: "No file selected!" });
    }

    try {
      const imageName = `images/${Date.now()}.jpg`;
      const compressedImageBuffer = await sharp(req.file.buffer)
        .resize(500)
        .jpeg({ quality: 30 })
        .toBuffer();

      const file = bucket.file(imageName);

      await file.save(compressedImageBuffer, {
        metadata: { contentType: "image/jpeg" },
        public: true,
      });

      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${imageName}`;

      const newImage = new Image({
        imageName: imageName,
        imageUrl: imageUrl,
      });

      await newImage.save();

      res.status(200).send({
        message: "File uploaded and compressed successfully!",
        imageName: imageName,
        imageUrl: imageUrl,
      });
    } catch (compressionError) {
      res.status(500).send({
        message: "File compression failed!",
        error: compressionError.message,
      });
    }
  });
});

app.post("/api/v1/result", async (req, res) => {
  try {
    const { userId, quizId, sections, timeTaken, attempts } = req.body;

    // Validate userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    // Validate quizId
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(400).json({ error: "Invalid quizId" });
    }

    // Initialize global counters
    let totalCorrectAnswers = 0;
    let totalIncorrectAnswers = 0;
    let totalScore = 0;
    let totalQuestions = 0;

    // Process each section
    const processedSections = await Promise.all(
      sections.map(async (section) => {
        let sectionCorrectAnswers = 0;
        let sectionIncorrectAnswers = 0;
        let sectionScore = 0;

        const processedSubsections = await Promise.all(
          section.subsections.map(async (subsection) => {
            let subsectionCorrectAnswers = 0;
            let subsectionIncorrectAnswers = 0;
            let subsectionScore = 0;

            const processedQuestions = await Promise.all(
              subsection.questions.map(async (q) => {
                const question = await Question.findById(q.questionId); // Fetch the question from DB

                if (!question) {
                  return res.status(404).json({ error: "Question not found" });
                }

                const isCorrect = q.selectedOption === question.correctAnswer;

                if (q.attempted) {
                  if (isCorrect) {
                    sectionCorrectAnswers += 1;
                    subsectionCorrectAnswers += 1;
                    sectionScore += 1;
                    subsectionScore += 1;
                  } else {
                    sectionIncorrectAnswers += 1;
                    subsectionIncorrectAnswers += 1;
                  }
                }

                return {
                  questionId: q.questionId,
                  attempted: q.attempted,
                  selectedOption: q.selectedOption,
                  correct: isCorrect,
                };
              })
            );

            // Track subsection stats
            totalCorrectAnswers += subsectionCorrectAnswers;
            totalIncorrectAnswers += subsectionIncorrectAnswers;
            totalScore += subsectionScore;
            totalQuestions += subsection.questions.length;

            return {
              subsectionId: subsection.subsectionId,
              score: subsectionScore,
              correctAnswers: subsectionCorrectAnswers,
              incorrectAnswers: subsectionIncorrectAnswers,
              questions: processedQuestions,
            };
          })
        );

        return {
          sectionId: section.sectionId,
          score: sectionScore,
          correctAnswers: sectionCorrectAnswers,
          incorrectAnswers: sectionIncorrectAnswers,
          subsections: processedSubsections,
        };
      })
    );

    // Determine pass/fail status (adjustable)
    const status = totalScore >= totalQuestions / 2 ? "pass" : "fail";

    // Create new result
    const newResult = new Result({
      userId,
      quizId,
      score: totalScore,
      correctAnswers: totalCorrectAnswers,
      incorrectAnswers: totalIncorrectAnswers,
      totalQuestions,
      timeTaken,
      attempts,
      status,
      sections: processedSections,
    });

    // Save the result to the database
    await newResult.save();

    // Send response
    return res.status(201).json({
      message: "Quiz result saved successfully",
      result: newResult,
    });
  } catch (error) {
    console.error("Error saving result:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
