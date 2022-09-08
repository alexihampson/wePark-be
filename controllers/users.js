const { insertUser, selectUserByName, selectAllUsers } = require("../models/users");

exports.postUser = (req, res, next) => {
  insertUser(req.body, req.file)
    .then((user) => {
      res.status(201).send({ user });
    })
    .catch(next);
};

exports.getUserByName = (req, res, next) => {
  const { username } = req.params;

  selectUserByName(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch(next);
};

exports.getAllUsers = (req, res, next) => {
  selectAllUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};
