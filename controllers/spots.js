const {
  selectAllSpots,
  insertSpot,
  fetchSpotBySpotId,
  removeSpotBySpotId,
  updateSpotBySpotId,
} = require("../models/spots");

exports.getSpotBySpotId = (req, res, next) => {
  const { spot_id } = req.params;

  fetchSpotBySpotId(spot_id)
    .then((spot) => {
      res.status(200).send(spot);
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteSpotBySpotId = (req, res, next) => {
  const { spot_id } = req.params;

  Promise.all([removeSpotBySpotId(spot_id), fetchSpotBySpotId(spot_id)])
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchSpotBySpotId = (req, res, next) => {
  const { spot_id } = req.params;
  const { inc_upvotes } = req.body;
  const { inc_downvotes } = req.body;
  Promise.all([updateSpotBySpotId(spot_id, inc_upvotes, inc_downvotes), fetchSpotBySpotId(spot_id)])
    .then(([spot]) => {
      res.status(200).send(spot);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllSpots = (req, res, next) => {
  const { query } = req;

  const [long, lat] = (query.coords || "53.483214,-2.200469").split(",");
  const radius = parseFloat(query.radius || 10) / 50;

  selectAllSpots(long, lat, radius, query.type, query.creator)
    .then((spots) => {
      res.status(200).send({ spots });
    })
    .catch(next);
};

exports.postSpot = (req, res, next) => {
  insertSpot(req.body, req.files)
    .then(([spot, images]) => {
      spot.images = images;
      res.status(201).send({ spot });
    })
    .catch(next);
};
