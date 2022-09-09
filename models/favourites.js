const db = require("../db/connection");
const format = require("pg-format");

exports.selectAllFavourites = async (username, sort_by = "popularity", order = "desc") => {
  if (order.toLowerCase() !== "desc" && order.toLowerCase() !== "asc")
    return Promise.reject({ status: 400, msg: "Bad Query" });

  const mainQuery = format(
    `SELECT favourites.favourite_id AS favourite_id, spots.spot_id AS spot_id, spots.name AS name, ST_X(spots.location) AS latitude, ST_Y(spots.location) AS longitude, spots.opening_time AS opening_time, 
    spots.closing_time AS closing_time, spots.time_limit AS time_limit, spots.parking_type AS parking_type, spots.upvotes - spots.downvotes AS vote_count
    FROM favourites LEFT JOIN spots ON spots.spot_id = favourites.spot_id WHERE username = '%s'`,
    username
  );

  let orderQuery;

  switch (sort_by) {
    case "age":
      orderQuery = format(" ORDER BY spots.created_at %s", order);
      break;
    case "popularity":
      orderQuery = format(" ORDER BY spots.upvotes-spots.downvotes %s", order);
      break;
    default:
      return Promise.reject({ status: 400, msg: "Bad Query" });
      break;
  }

  const { rows } = await db.query(mainQuery + orderQuery + ";");

  return rows;
};

exports.insertFavourite = async (username, spot_id) => {
  if (!spot_id) return Promise.reject({ status: 400, msg: "Body Invalid" });

  const {
    rows: [row],
  } = await db.query("INSERT INTO favourites (spot_id, username) VALUES ($1,$2) RETURNING *;", [
    spot_id,
    username,
  ]);

  return row;
};

exports.removeFavourite = async (favourite_id) => {
  const {
    rows: [row],
  } = await db.query("DELETE FROM favourites WHERE favourite_id=$1 RETURNING *;", [favourite_id]);

  if (!row) return Promise.reject({ status: 404, msg: "ID Not Found" });

  return row;
};
