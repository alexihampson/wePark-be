exports.customErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.psqlErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
};

exports.badRequest = (err, req, res, next) => {
  if (err.code === "42703") {
    res.status(400).send({ msg: "Query Error" });
  } else {
    next(err);
  }
};

exports.badGeometry = (err, req, res, next) => {
  if (err.code === "XX000") {
    res.status(400).send({ msg: "Bad Geometry" });
  } else {
    next(err);
  }
};

exports.sqlForeignKeyConstraint = (err, req, res, next) => {
  if (err.code === "23503") {
    if (err.table === "spots") {
      res.status(400).send({ msg: "Body Invalid" });
    } else {
      res.status(404).send({ msg: "ID not found" });
    }
  } else {
    next(err);
  }
};

exports.sqlDuplicateKey = (err, req, res, next) => {
  if (err.code === "23505") {
    res.status(400).send({ msg: "Invalid Key" });
  } else {
    next(err);
  }
};
