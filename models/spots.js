const db = require("../db/connection");
const format = require("pg-format");

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
    " ORDER BY ST_Distance(location, %s) LIMIT 10",
    `ST_GeometryFromText('POINT(${long} ${lat})')`
  );

  const { rows } = await db.query(mainSection + whereSection + limitSection + ";");

  return rows;
};
