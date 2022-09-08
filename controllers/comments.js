const comments = require("../db/data/test-data/comments");
const { selectCommentsBySpot } = require("../models/comments");
const { fetchSpotBySpotId } = require("../models/spots");

exports.getCommentsBySpot = (req, res, next) => {
  const { spot_id } = req.params;
  Promise.all([selectCommentsBySpot(spot_id), fetchSpotBySpotId(spot_id)])
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};
