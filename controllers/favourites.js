const {
  selectAllFavourites,
  insertFavourite,
  removeFavourite,
  removeFavouriteByUser,
} = require("../models/favourites");
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

exports.deleteFavourite = (req, res, next) => {
  const { favourite_id } = req.params;

  removeFavourite(favourite_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

exports.deleteFavouriteByUser = (req, res, next) => {
  const { username, spot_id } = req.params;

  removeFavouriteByUser(username, spot_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
