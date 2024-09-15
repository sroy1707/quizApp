const express = require("express");
const questionController = require("../controllers/questionController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  // .get(authController.protect, questionController.getAllQuestion)
  .get(questionController.getAllQuestion)
  .post(questionController.createQuestion);

router
  .route("/:id")
  .get(questionController.getQuestionById)
  .patch(questionController.updateQuestion)
  .delete(
    authController.protect,
    authController.restrictTo("administrator", "admin"),
    questionController.deleteQuestionById
  );

module.exports = router;
