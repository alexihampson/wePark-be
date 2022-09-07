exports.customErrors = (err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({msg: err.msg}); 
    } else {
        next(err); 
    }
}

exports.psqlErrors = (err, req, res, next) => {
    if (err.code === "22P02") {
        res.status(400).send({msg: "Bad request"}); 
    } else {
      next(err);
      }
}

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
