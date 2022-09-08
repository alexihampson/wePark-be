const db = require("../db/connection");
const format = require("pg-format");
const AWS = require("aws-sdk");

if (
  !process.env.AWS_S3_ACCESS_KEY_ID ||
  !process.env.AWS_S3_SECRET_ACCESS_KEY ||
  !process.env.AWS_S3_BUCKET_NAME
) {
  require("dotenv").config({ path: `${__dirname}/../.env.aws_config` });
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});

exports.insertUser = async (body, avatar) => {
  if (!body.username) return Promise.reject({ status: 400, msg: "Body Invalid" });

  let avatar_url = "https://2022-6-sem1-proj5.s3.amazonaws.com/avatar-icon-white.jpg";

  if (avatar) {
    const blob = avatar.buffer;
    const imagePath = `${avatar.fieldname}_${Date.now()}_${avatar.originalname}`;
    const uploadedImage = await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: imagePath,
        Body: blob,
      })
      .promise();
    avatar_url = uploadedImage.Location;
  }

  const insertQuery = format(
    "INSERT INTO users (username, avatar_url, about, email) VALUES (%L) RETURNING *;",
    [body.username, avatar_url, body.about, body.email]
  );

  const {
    rows: [row],
  } = await db.query(insertQuery);

  return row;
};
