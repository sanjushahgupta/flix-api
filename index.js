require("./passport.js");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const accessLogStream = fs.createWriteStream(path.join("log.txt"), {
  flags: "a",
});

/** set the port for the server to listen */
const port = process.env.PORT || 8080;

/** Enable Cross-Origin Resource Sharing for the Express app*/
app.use(cors());

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require("./controllers/auth.js")(app);

/** Connect to MongoDB */
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

require("./routes/routes.js")(app);

app.use(express.static("public"));
app.use(morgan("combined", { stream: accessLogStream }));
app.use((err, req, res, next) => {
  res.status(500).send("error" + err);
});

/** Start the server and listen on the specified port */
app.listen(port, "0.0.0.0", () => {
  console.log("App is listening in " + port);
});
