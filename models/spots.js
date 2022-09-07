const db = require("../db/connection");

exports.fetchSpotBySpotId = async (spot_id) => {
    const result = await db.query(`SELECT spots.spot_id, spots.name, CONCAT(ST_X(location), ',', ST_Y(location)) AS coords, 
    spots.description, spots.opening_time, spots.closing_time, spots.time_limit, spots.upvotes, spots.downvotes, spots.parking_type, 
    spots.creator, spots.created_at, spots.isbusy, spots.lastchanged, string_agg(images.image_url, ',') AS images, 
    (SELECT COUNT(images.image_url) :: INT) AS image_count FROM spots LEFT JOIN images ON spots.spot_id = images.spot_id WHERE spots.spot_id = $1 GROUP BY spots.spot_id;`, [spot_id])
    const { rows: [row] } = result
    if (!row) {
        return Promise.reject({
            status: 404, 
            msg: "Spot not found"
        })
    }
    return row 
}   
