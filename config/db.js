const mongoose = require("mongoose");

const connection = mongoose.connect(
  "mongodb+srv://themanvendra:themanvendra@cluster0.jn0it5t.mongodb.net/eval2?retryWrites=true&w=majority"
);

module.exports = {
  connection,
};
