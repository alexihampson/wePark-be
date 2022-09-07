const spotRouter = require("express").Router();
const { getSpotBySpotId } = require("../controllers/spots")

spotRouter
    .route("/:spot_id")
    .get(getSpotBySpotId); 

module.exports = spotRouter;
