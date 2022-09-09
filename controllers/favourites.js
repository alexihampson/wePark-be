const { selectAllFavourites, insertFavourite } = require("../models/favourites");
const { selectUserByName } = require("../models/users");

exports.getAllFavourites = (req, res, next) => {
  const { username } = req.params;
  const { sort_by, order } = req.query;

  Promise.all([selectAllFavourites(username, sort_by, order), selectUserByName(username)])
    .then(([spots]) => {
      res.status(200).send({ spots });
    })
    .catch(next);
};

exports.postFavourite = (req, res, next) => {};
