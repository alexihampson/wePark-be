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

exports.selectUserByName = async (username) => {
  const {
    rows: [row],
  } = await db.query("SELECT * FROM users WHERE username=$1;", [username]);

  if (!row) return Promise.reject({ status: 404, msg: "User Not Found" });

  const favs = (await db.query("SELECT spot_id FROM favourites WHERE username = $1;", [username]))
    .rows;

  row.favourites = favs.map((val) => val.spot_id);

  return row;
};

exports.selectAllUsers = async () => {
  const { rows } = await db.query("SELECT username, avatar_url FROM users;");

  return rows;
};

exports.updateUser = async (username, body, avatar) => {
  if (!body.about && !body.email) return Promise.reject({ status: 400, msg: "Body Invalid" });

  const currUser = (await db.query("SELECT * FROM users WHERE username=$1;", [username])).rows[0];

  let avatar_url = currUser.avatar_url;

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

    if (
      currUser.avatar_url !== "https://2022-6-sem1-proj5.s3.amazonaws.com/avatar-icon-white.jpg"
    ) {
      s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: currUser.avatar_url,
      }).promise();
    }
  }

  const {
    rows: [row],
  } = await db.query(
    "UPDATE users SET avatar_url=$1,about=$2,email=$3 WHERE username=$4 RETURNING *;",
    [avatar_url, body.about || currUser.about, body.email || currUser.email, username]
  );

  return row;
};
