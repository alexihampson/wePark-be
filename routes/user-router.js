const userRouter = require("express").Router();
const { postUser, getUserByName, getAllUsers } = require("../controllers/users");
const { getAllFavourites } = require("../controllers/favourites");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

userRouter.route("/").get(getAllUsers).post(upload.single("avatar"), postUser);

userRouter.route("/:username").get(getUserByName);

userRouter.route("/:username/favourites").get(getAllFavourites);

module.exports = userRouter;
