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

exports.removeCommentById = async (comment_id) => {
  const {
    rows: [row],
  } = await db.query("DELETE FROM comments WHERE comment_id=$1 RETURNING *;", [comment_id]);

  if (!row) return Promise.reject({ status: 404, msg: "Comment Not Found" });

  return row;
};

exports.updateCommentById = async (comment_id, inc_upvotes = 0, inc_downvotes = 0) => {
  if (!inc_upvotes && !inc_downvotes) return Promise.reject({ status: 400, msg: "Body Invalid" });

  const {
    rows: [row],
  } = await db.query(
    `UPDATE comments SET upvotes=upvotes+$1, downvotes=downvotes+$2 WHERE comment_id=$3 RETURNING *;`,
    [inc_upvotes, inc_downvotes, comment_id]
  );

  if (!row) return Promise.reject({ status: 404, msg: "Comment Not Found" });

  return row;
};
