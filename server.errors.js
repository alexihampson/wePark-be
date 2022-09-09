exports.customErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.psqlErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
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
    if (err.table === "spots" || err.table === "comments") {
      res.status(400).send({ msg: "Body Invalid" });
    } else if (err.table === "favourites") {
      switch (err.constraint) {
        case "favourites_spot_id_fkey":
          res.status(404).send({ msg: "Spot Not Found" });
          break;
        default:
          res.status(404).send({ msg: "User Not Found" });
          break;
      }
    } else {
      res.status(404).send({ msg: "ID Not Found" });
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
