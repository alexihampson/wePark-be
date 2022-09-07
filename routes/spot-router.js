const spotRouter = require("express").Router();
const { getAllSpots } = require("../controllers/spots");

spotRouter.route("/").get(getAllSpots);

module.exports = spotRouter;
