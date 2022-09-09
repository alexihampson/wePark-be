const { selectAllFavourites, insertFavourite } = require("../models/favourites");
const { selectUserByName } = require("../models/users");
const { fetchSpotBySpotId } = require("../models/spots");

exports.getAllFavourites = (req, res, next) => {
  const { username } = req.params;
  const { sort_by, order } = req.query;

  Promise.all([selectAllFavourites(username, sort_by, order), selectUserByName(username)])
    .then(([spots]) => {
      res.status(200).send({ spots });
    })
    .catch(next);
};

exports.postFavourite = (req, res, next) => {
  const { username } = req.params;
  const { spot_id } = req.body;

  Promise.all([
    insertFavourite(username, spot_id),
    selectUserByName(username),
    fetchSpotBySpotId(spot_id),
  ])
    .then(([favourite, user, spot]) => {
      res.status(201).send({ spot });
    })
    .catch(next);
};