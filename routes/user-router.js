const userRouter = require("express").Router();
const { postUser } = require("../controllers/users");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

userRouter.route("/").post(upload.single("avatar"), postUser);

module.exports = userRouter;
