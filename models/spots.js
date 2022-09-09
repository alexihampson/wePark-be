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

exports.fetchSpotBySpotId = async (spot_id) => {
  const result = await db.query(
    `SELECT spots.spot_id, spots.name, ST_X(location) AS longitude, ST_Y(location) AS latitude, 
    spots.description, spots.opening_time, spots.closing_time, spots.time_limit, spots.upvotes, spots.downvotes, spots.parking_type, 
    spots.creator, spots.created_at, spots.isbusy, spots.lastchanged, string_agg(images.image_url, ',') AS images, 
    (SELECT COUNT(images.image_url) :: INT) AS image_count FROM spots LEFT JOIN images ON spots.spot_id = images.spot_id WHERE spots.spot_id = $1 GROUP BY spots.spot_id;`,
    [spot_id]
  );

  const {
    rows: [row],
  } = result;

  if (!row) {
    return Promise.reject({
      status: 404,
      msg: "Spot Not Found",
    });
  }
  return row;
};

exports.removeSpotBySpotId = async (spot_id) => {
  const images = await db.query(`SELECT * FROM images WHERE spot_id = $1`, [spot_id]);
  if (images.rows) {
    for (const image of images.rows) {
      const URL = image.image_url.split("/").pop();
      const deleteData = await s3
        .deleteObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: URL,
        })
        .promise();
    }
  }
  return (deleteSpot = await db.query(`DELETE FROM spots WHERE spot_id = $1`, [spot_id]));
};

exports.updateSpotBySpotId = async (spot_id, inc_upvotes = 0, inc_downvotes = 0) => {
  if (!inc_upvotes && !inc_downvotes) {
    return Promise.reject({
      status: 400,
      msg: "Missing required fields",
    });
  }

  const incrementVotes = await db.query(
    `UPDATE spots SET upvotes = upvotes + $1, downvotes = downvotes + $2 WHERE spot_id = $3 RETURNING spot_id, name, ST_X(location) AS longitude, ST_Y(location) AS latitude, 
    description, opening_time, closing_time, time_limit, upvotes, downvotes, parking_type, 
    creator, created_at, isbusy, lastchanged;`,
    [inc_upvotes, inc_downvotes, spot_id]
  );

  return incrementVotes.rows[0];
};

exports.selectAllSpots = async (long, lat, radius, type, creator) => {
  const mainSection = format(
    "SELECT spot_id, name, ST_X(location) AS longitude, ST_Y(location) AS latitude, opening_time, closing_time, time_limit, parking_type, upvotes - downvotes AS votes FROM spots"
  );

  const whereList = [];

  if (type) {
    whereList.push(format("parking_type='%s'", type));
  }

  if (creator) {
    if (!(await db.query("SELECT * FROM users WHERE username=$1;", [creator])).rows[0])
      return Promise.reject({ status: 404, msg: "User Not Found" });
    whereList.push(format("creator='%s'", creator));
  }

  whereList.push(
    format("ST_DWithin(location, ST_GeometryFromText('POINT(%s %s)'), %s)", long, lat, radius)
  );

  const whereSection = " WHERE " + whereList.join(" AND ");

  const limitSection = format(
    " ORDER BY ST_Distance(location, %s) LIMIT 20",
    `ST_GeometryFromText('POINT(${long} ${lat})')`
  );

  const { rows } = await db.query(mainSection + whereSection + limitSection + ";");

  return rows;
};

exports.insertSpot = async (body, images) => {
  if (!images) images = [];

  if (!body.longitude || !body.latitude || !body.name || !body.creator || !body.parking_type)
    return Promise.reject({ status: 400, msg: "Body Invalid" });

  const insertQuery = format(
    `INSERT INTO spots (name, description, location, opening_time, closing_time, time_limit, parking_type, creator) VALUES (%L) RETURNING spot_id, name, ST_X(location) AS longitude, ST_Y(location) AS latitude, 
    description, opening_time, closing_time, time_limit, upvotes, downvotes, parking_type, 
    creator, created_at, isbusy, lastchanged;`,
    [
      body.name,
      body.description,
      `POINT(${body.longitude} ${body.latitude})`,
      body.opening_time,
      body.closing_time,
      body.time_limit,
      body.parking_type,
      body.creator,
    ]
  );

  const {
    rows: [row],
  } = await db.query(insertQuery);

  const spot_id = row.spot_id;

  const imageUrls = [];

  for (const image of images) {
    const blob = image.buffer;
    const imagePath = `${image.fieldname}_${Date.now()}_${image.originalname}`;
    const uploadedImage = await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: imagePath,
        Body: blob,
      })
      .promise();
    imageUrls.push(uploadedImage.Location);
  }

  const imageRows = await Promise.all(
    imageUrls.map((imageUrl) =>
      db.query("INSERT INTO images (image_url, spot_id) VALUES ($1,$2) RETURNING *;", [
        imageUrl,
        spot_id,
      ])
    )
  );

  delete Object.assign(row, { ["coords"]: row["location"] })["location"];

  return [row, imageRows.map((row) => row.rows[0].image_url).join(",")];
};
