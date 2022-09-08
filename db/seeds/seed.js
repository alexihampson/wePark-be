const format = require("pg-format");
const db = require("../connection");

const seed = async ({ userData, spotData, imageData, commentData, favouritesData, dataData }) => {
  await db.query(`DROP TABLE IF EXISTS data;`);
  await db.query(`DROP TABLE IF EXISTS favourites;`);
  await db.query(`DROP TABLE IF EXISTS comments;`);
  await db.query(`DROP TABLE IF EXISTS images;`);
  await db.query(`DROP TABLE IF EXISTS spots;`);
  await db.query(`DROP TABLE IF EXISTS users;`);

  await db.query(`CREATE TABLE users (
    username VARCHAR PRIMARY KEY,
    avatar_url VARCHAR,
    about VARCHAR,
    email VARCHAR,
    karma INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );`);

  await db.query(`CREATE TABLE spots (
    spot_id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description VARCHAR,
    location geometry(POINT),
    opening_time TIME DEFAULT '00:00',
    closing_time TIME DEFAULT '00:00',
    time_limit SMALLINT,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    parking_type VARCHAR NOT NULL,
    creator VARCHAR NOT NULL REFERENCES users(username),
    created_at TIMESTAMP DEFAULT NOW(),
    isbusy BOOLEAN DEFAULT FALSE,
    lastChanged TIMESTAMP DEFAULT NOW()
    );`);

  await db.query(`CREATE TABLE images (
        image_url VARCHAR PRIMARY KEY,
        spot_id INT NOT NULL REFERENCES spots(spot_id) ON DELETE CASCADE
        );`);
  await db.query(`CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        spot_id INT NOT NULL REFERENCES spots(spot_id),
        author VARCHAR NOT NULL REFERENCES users(username),
        body VARCHAR NOT NULL,
        upvotes INT NOT NULL DEFAULT 0,
        downvotes INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
        );`);
  await db.query(`CREATE TABLE favourites (
        favourite_id SERIAL PRIMARY KEY,
        username VARCHAR NOT NULL REFERENCES users(username),
        spot_id INT NOT NULL REFERENCES spots(spot_id)
      );`);
  await db.query(`CREATE TABLE data (
        data_id SERIAL PRIMARY KEY,
        spot_id INT NOT NULL REFERENCES spots(spot_id),
        isBusy BOOLEAN NOT NULL DEFAULT FALSE,
        change_time TIMESTAMP DEFAULT NOW()
      );`);

  const userQueryStr = format(
    "INSERT INTO users (username, avatar_url, about, email) VALUES %L RETURNING *;",
    userData.map(({ username, avatar_url, about, email }) => [username, avatar_url, about, email])
  );

  const spotQueryStr = format(
    "INSERT INTO spots (name, description, location, opening_time, closing_time, time_limit, parking_type, creator) VALUES %L RETURNING *;",
    spotData.map(
      ({
        name,
        description,
        longitude,
        latitude,
        opening_time,
        closing_time,
        time_limit,
        parking_type,
        creator,
      }) => [
        name,
        description,
        `POINT(${longitude} ${latitude})`,
        opening_time,
        closing_time,
        time_limit,
        parking_type,
        creator,
      ]
    )
  );

  const imageQueryStr = format(
    "INSERT INTO images (image_url, spot_id) VALUES %L RETURNING *;",
    imageData.map(({ image_url, spot_id }) => [image_url, spot_id])
  );

  const commentQueryStr = format(
    "INSERT INTO comments (spot_id, author, body) VALUES %L RETURNING *;",
    commentData.map(({ spot_id, author, body }) => [spot_id, author, body])
  );

  const favouriteQueryStr = format(
    "INSERT INTO favourites (spot_id, username) VALUES %L RETURNING *;",
    favouritesData.map(({ spot_id, username }) => [spot_id, username])
  );

  const dataQueryStr = format(
    "INSERt INTO data (spot_id, isBusy) VALUES %L RETURNING *;",
    dataData.map(({ spot_id, isBusy }) => [spot_id, isBusy])
  );

  await db.query(userQueryStr).then((result) => result.rows);
  await db.query(spotQueryStr).then((result) => result.rows);

  return Promise.all([
    db.query(imageQueryStr).then((result) => result.rows),
    db.query(commentQueryStr).then((result) => result.rows),
    db.query(favouriteQueryStr).then((result) => result.rows),
    db.query(dataQueryStr).then((result) => result.rows),
  ]);
};

module.exports = seed;
