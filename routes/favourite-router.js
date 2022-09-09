const favouriteRouter = require("express").Router();
const { deleteFavourite } = require("../controllers/favourites");

favouriteRouter.route("/:favourite_id").delete(deleteFavourite);

module.exports = favouriteRouter;
