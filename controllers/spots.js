const { fetchSpotBySpotId } = require("../models/spots");

exports.getSpotBySpotId = (req, res, next) => {
    const { spot_id } = req.params; 
    fetchSpotBySpotId(spot_id).then((spot) => {
        res.status(200).send(spot); 
    })
    .catch((err) => {
        console.log(err);
        next(err)
    })
}

const { selectAllSpots } = require("../models/spots");

exports.getAllSpots = (req, res, next) => {
  const { query } = req;

  const [long, lat] = (query.coords || "53.483214,-2.200469").split(",");
  const radius = parseFloat(query.radius || 10) / 50;

  selectAllSpots(long, lat, radius, query.type)
    .then((spots) => {
      res.status(200).send({ spots });
    })
    .catch(next);
};
