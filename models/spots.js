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

exports.selectAllSpots = async (long, lat, radius, type) => {
  const mainSection = format(
    "SELECT spot_id, name, CONCAT(ST_X(location), ',', ST_Y(location)) AS coords, opening_time, closing_time, time_limit, parking_type, upvotes - downvotes AS votes FROM spots"
  );

  let whereSection;

  if (type) {
    whereSection = format(
      " WHERE parking_type='%s' AND ST_DWithin(location, ST_GeometryFromText('POINT(%s %s)'), %s)",
      type,
      long,
      lat,
      radius
    );
  } else {
    whereSection = format(
      " WHERE ST_DWithin(location, ST_GeometryFromText('POINT(%s %s)'), %s)",
      long,
      lat,
      radius
    );
  }

  const limitSection = format(
    " ORDER BY ST_Distance(location, %s) LIMIT 20",
    `ST_GeometryFromText('POINT(${long} ${lat})')`
  );

  const { rows } = await db.query(mainSection + whereSection + limitSection + ";");

  return rows;
};

exports.insertSpot = async (body, images) => {
  if (!body.coords || !body.name || !body.creator || !body.parking_type)
    return Promise.reject({ status: 400, msg: "Body Invalid" });

  const [long, lat] = body.coords.split(",");

  const insertQuery = format(
    "INSERT INTO spots (name, description, location, opening_time, closing_time, time_limit, parking_type, creator) VALUES (%L) RETURNING *;",
    [
      body.name,
      body.description,
      `POINT(${long} ${lat})`,
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

  return [row, imageRows.map((row) => row.rows[0].image_url).join(",")];
};
