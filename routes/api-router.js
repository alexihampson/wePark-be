const apiRouter = require("express").Router();
const spotRouter = require("./spot-router");
const userRouter = require("./user-router");
const commentRouter = require("./comment-router");

apiRouter.get("/", (req, res) => {
  res.status(200).send({ msg: "Hello" });
});

apiRouter.use("/spots", spotRouter);

apiRouter.use("/users", userRouter);

apiRouter.use("/comments", commentRouter);

module.exports = apiRouter;
