const spotRouter = require("express").Router();
const { getSpotBySpotId, getAllSpots } = require("../controllers/spots")

spotRouter.route("/").get(getAllSpots);

spotRouter
    .route("/:spot_id")
    .get(getSpotBySpotId); 

module.exports = spotRouter;
