const apiRouter = require("express").Router();
const spotRouter = require("./spot-router");
const userRouter = require("./user-router");

apiRouter.get("/", (req, res) => {
  res.status(200).send({ msg: "Hello" });
});

apiRouter.use("/spots", spotRouter);

apiRouter.use("/users", userRouter);

module.exports = apiRouter;
