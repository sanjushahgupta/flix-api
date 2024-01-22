require("./passport.js");
const sharp = require("sharp");

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

const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: "eu-central-1",
  //endpoint: "http://localhost:4566",
  forcePathStyle: true,
});
const myImageBucket = "image-bucket-535";
const listObjectsParams = {
  Bucket: myImageBucket,
};

const fileUpload = require("express-fileupload");

/** set the port for the server to listen */
const port = process.env.PORT || 8080;

/** Enable Cross-Origin Resource Sharing for the Express app*/
require("./routes/routes.js")(app);
require("./controllers/auth.js")(app);
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

/** Connect to MongoDB */
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static("public"));
app.use(morgan("combined", { stream: accessLogStream }));
app.use((err, req, res, next) => {
  res.status(500).send("error" + err);
});

//list all objects of s3 bucket
app.get("/images", (req, res) => {
  s3Client
    .send(new ListObjectsV2Command(listObjectsParams))
    .then((listObjectsResponse) => {
      res.send(listObjectsResponse);
    })
    .catch((error) => {
      res.status(404).json({ error: "Objects not found." });
    });
});

//list specific object's details of s3
app.get("/image:key", (req, res) => {
  const objectKey = req.params.key.replace(":", "");
  const getObjectParams = {
    Bucket: myImageBucket,
    Key: objectKey,
  };

  s3Client
    .send(new GetObjectCommand(getObjectParams))
    .then((getObjectResponse) => {
      const responseObject = {
        LastModified: getObjectResponse.LastModified,
        ETag: getObjectResponse.ETag,
        Size: getObjectResponse.ContentLength,
        ContentType: getObjectResponse.ContentType,
      };
      res.json(responseObject);
    })
    .catch((error) => {
      console.error("Error retrieving S3 object:", error.message);
      res
        .status(404)
        .send(
          "Image not found or could not be retrieved. Error message: " +
            error.message
        );
    });
});

// To upload images directly to S3
app.post("/image", (req, res) => {
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
      res.status(200).json({ message: "File uploaded successfully." });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

//Fetched, resized and uploaded to S3.
app.get("/resize", async (req, res) => {
  const imageToResize = req.query.image;
  let imageBuffer;
  try {
    imageBuffer = await getObjectFromS3(imageToResize);
  } catch (e) {
    if (e.Code == "NoSuchKey") {
      res.send("That file does not exist.");
      return;
    }

    res.send(e.message);
    return;
  }

  const resizedBuffer = await resizeImage(imageBuffer);

  try {
    await UploadToS3(resizedBuffer, imageToResize);
    res.send("Fetched, resized and uploaded to S3.");
  } catch (error) {
    res.send(error);
  }
});

//
async function getObjectFromS3(objectKey) {
  const getObjectParams = {
    Bucket: myImageBucket,
    Key: objectKey,
  };

  try {
    const response = await s3Client.send(new GetObjectCommand(getObjectParams));
    const Imagebuffer = await streamToBuffer(response.Body);
    return Imagebuffer;
  } catch (error) {
    throw error;
  }
}

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

async function resizeImage(imageToBeResize) {
  let transform = sharp(imageToBeResize);
  transform = transform.resize({
    width: 70,
    height: 70,
    fit: sharp.fit.inside,
  });
  const resizedBuffer = await transform.toBuffer();

  return resizedBuffer;
}

//to upload
async function UploadToS3(file, name) {
  let putObjectParams;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  if (file.name) {
    const fileContent = fs.readFileSync(file.tempFilePath);
    putObjectParams = {
      Bucket: myImageBucket,
      Key: file.name,
      Body: fileContent,
    };
  } else {
    const fileName = "thumbnail_" + name;
    putObjectParams = {
      Bucket: myImageBucket,
      Key: fileName,
      Body: file,
    };
  }

  try {
    const putObjectCmd = new PutObjectCommand(putObjectParams);
    await s3Client.send(putObjectCmd);
    return;
  } catch (error) {
    throw error;
  }
}

/** Start the server and listen on the specified port */
app.listen(port, "0.0.0.0", () => {
  console.log("App is listening in " + port);
});
