const spotRouter = require("express").Router();
const { getAllSpots, postSpot } = require("../controllers/spots");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

spotRouter.route("/").get(getAllSpots).post(upload.array("images"), postSpot);

module.exports = spotRouter;
