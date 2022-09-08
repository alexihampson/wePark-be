const { insertUser } = require("../models/users");

exports.postUser = (req, res, next) => {
  insertUser(req.body, req.file)
    .then((user) => {
      res.status(201).send({ user });
    })
    .catch(next);
};
