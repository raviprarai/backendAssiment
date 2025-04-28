const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

exports.connect = () => {
  mongoose
     .connect(process.env.mongoDbUrl)
   // .connect("mongodb://localhost:27017/testing")
    .then(() => console.log("Database Connected Successfully...."))
    .catch((err) => console.log(`DB connection error: ${err.message}`));

  mongoose.connection.on("error", (err) => {
    console.log(`DB connection error: ${err.message}`);
  });
};