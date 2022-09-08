const userRouter = require("express").Router();
const { postUser, getUserByName, getAllUsers } = require("../controllers/users");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

userRouter.route("/").get(getAllUsers).post(upload.single("avatar"), postUser);

userRouter.route("/:username").get(getUserByName);

module.exports = userRouter;
