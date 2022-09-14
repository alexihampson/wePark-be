const userRouter = require("express").Router();
const {
  postUser,
  getUserByName,
  getAllUsers,
  patchUserByName,
  postUserByNameWithPass,
} = require("../controllers/users");
const {
  getAllFavourites,
  postFavourite,
  deleteFavouriteByUser,
} = require("../controllers/favourites");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

userRouter.route("/").get(getAllUsers).post(upload.single("avatar"), postUser);

userRouter
  .route("/:username")
  .get(getUserByName)
  .patch(upload.single("avatar"), patchUserByName)
  .post(postUserByNameWithPass);

userRouter.route("/:username/favourites").get(getAllFavourites).post(postFavourite);

userRouter.route("/:username/favourites/:spot_id").delete(deleteFavouriteByUser);

module.exports = userRouter;
