const apiRouter = require("express").Router();
const spotRouter = require("./spot-router");
const userRouter = require("./user-router");
const commentRouter = require("./comment-router");
const favouriteRouter = require("./favourite-router");
const endpoints = require("../endpoints.json");

apiRouter.get("/", (req, res) => {
  res.status(200).send({ endpoints });
});

apiRouter.use("/spots", spotRouter);

apiRouter.use("/users", userRouter);

apiRouter.use("/comments", commentRouter);

apiRouter.use("/favourites", favouriteRouter);

module.exports = apiRouter;
