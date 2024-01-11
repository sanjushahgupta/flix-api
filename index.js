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

const myImageBucket = "image-bucket-535";
const fileUpload = require("express-fileupload");
const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

/** set the port for the server to listen */
const port = process.env.PORT || 8080;

/** Enable Cross-Origin Resource Sharing for the Express app*/
app.use(cors());

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

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

const s3Client = new S3Client({
  region: "eu-central-1",
  endpoint: "http://localhost:4566",
  forcePathStyle: true,
});

app.get("/images", (req, res) => {
  const listObjectsParams = {
    Bucket: myImageBucket,
  };

  s3Client
    .send(new ListObjectsV2Command(listObjectsParams))
    .then((listObjectsResponse) => {
      res.send(listObjectsResponse);
    });
});

// To upload images directly to S3
app.post("/images", (req, res) => {
  const file = req.files.image;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const fileName = file.name;
  const fileContent = fs.readFileSync(file.tempFilePath);

  const putObjectParams = {
    Bucket: myImageBucket,
    Key: fileName,
    Body: fileContent,
  };

  const putObjectCmd = new PutObjectCommand(putObjectParams);

  s3Client
    .send(putObjectCmd)
    .then((data) => {
      console.log("File uploaded successfully:", data);
      res.status(200).json({ message: "File uploaded successfully." });
    })
    .catch((error) => {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Internal Server Error." });
    });
});

/** Start the server and listen on the specified port */
app.listen(port, "0.0.0.0", () => {
  console.log("App is listening in " + port);
});
