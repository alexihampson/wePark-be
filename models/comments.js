const db = require("../db/connection");

exports.selectCommentsBySpot = async (spot_id) => {
  const { rows } = await db.query(
    "SELECT comment_id, author, body, upvotes, downvotes, created_at FROM comments WHERE spot_id=$1;",
    [spot_id]
  );

  return rows;
};
