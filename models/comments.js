const db = require("../db/connection");
const format = require("pg-format");

exports.selectCommentsBySpot = async (spot_id) => {
  const { rows } = await db.query(
    "SELECT comment_id, author, body, upvotes, downvotes, created_at FROM comments WHERE spot_id=$1;",
    [spot_id]
  );

  return rows;
};

exports.insertCommentBySpot = async (spot_id, body) => {
  if (!body.author || !body.body) return Promise.reject({ status: 400, msg: "Body Invalid" });

  const insertQuery = format(
    "INSERT INTO comments (spot_id, author, body) VALUES (%L) RETURNING *;",
    [spot_id, body.author, body.body]
  );

  const {
    rows: [row],
  } = await db.query(insertQuery);

  return row;
};
