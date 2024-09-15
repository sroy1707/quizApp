const mongoose = require("mongoose");
const imageSchema = new mongoose.Schema({
  imageName: String,
  imageUrl: String,
  uploadDate: { type: Date, default: Date.now },
});

imageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
