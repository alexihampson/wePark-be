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

exports.selectAllComments = async (author, sort_by = "age", order = "desc") => {
  if (order.toLowerCase() !== "desc" && order.toLowerCase() !== "asc")
    return Promise.reject({ status: 400, msg: "Bad Query" });

  const mainQuery = format(
    "SELECT body, created_at, author, spot_id, comment_id, upvotes - downvotes AS vote_count FROM comments"
  );

  let whereQuery = "";

  if (author) {
    if (!(await db.query("SELECT * FROM users WHERE username=$1;", [author])).rows[0])
      return Promise.reject({ status: 404, msg: "Author Not Found" });
    whereQuery = format(" WHERE author='%s'", author);
  }

  let sortQuery = "";

  switch (sort_by) {
    case "age":
      sortQuery = format(" ORDER BY created_at %s", order);
      break;
    case "popularity":
      sortQuery = format(" ORDER BY upvotes-downvotes %s", order);
      break;
    case "controversial":
      sortQuery = format(" ORDER BY upvotes - downvotes ASC, upvotes + downvotes DESC");
      break;
    default:
      return Promise.reject({ status: 400, msg: "Bad Query" });
  }

  const { rows } = await db.query(mainQuery + whereQuery + sortQuery + ";");

  return rows;
};
