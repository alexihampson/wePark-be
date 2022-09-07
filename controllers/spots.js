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
