const express = require("express");
const apiRouter = require("./routes/api-router");
const cors = require("cors");
const AWS = require("aws-sdk");

if (
  !process.env.AWS_S3_ACCESS_KEY_ID ||
  !process.env.AWS_S3_SECRET_ACCESS_KEY ||
  !process.env.AWS_S3_BUCKET_NAME
) {
  require("dotenv").config({ path: `${__dirname}/.env.aws_config` });
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});

const app = express();

app.use(cors());

app.use("/api", apiRouter);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

//-----//-----// Error Handlers //-----//-----//

app.use((err, req, res, next) => {
  console.log(err);
  res.sendStatus(500);
});

//-----// No More Error Handlers //-----//

module.exports = app;
