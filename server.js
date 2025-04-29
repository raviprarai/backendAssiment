const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { connect } = require("./connection/db");
dotenv.config();
const express = require("express");
const app = express();

const PORT = process.env.PORT || 8001;

app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());
//app.use(cors());
app.use(cors({
  origin: 'https://appblogs.netlify.app',  
  credentials: true                      
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
connect();

 app.use("/api/User", require("./router/userRouter"));


app.get("/", (req, res) => {
  res.send("<h1>A Node Js API is listening on port:8001</h1>");
})

app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));