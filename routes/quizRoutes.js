const express = require("express");
const quizController = require("../controllers/quizController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  // .get(authController.protect, quizController.getAllQuestion)
  .get(quizController.getAllQuiz)
  .post(quizController.createQuiz);

router
  .route("/:id")
  .get(quizController.getQuizById)
  .patch(quizController.updateQuiz)
  .delete(
    // authController.protect,
    // authController.restrictTo("administrator", "admin"),
    quizController.deleteQuizById
  );

module.exports = router;
