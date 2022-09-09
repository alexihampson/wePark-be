const comments = require("../db/data/test-data/comments");
const {
  selectCommentsBySpot,
  insertCommentBySpot,
  removeCommentById,
  updateCommentById,
} = require("../models/comments");
const { fetchSpotBySpotId } = require("../models/spots");

exports.getCommentsBySpot = (req, res, next) => {
  const { spot_id } = req.params;

  Promise.all([selectCommentsBySpot(spot_id), fetchSpotBySpotId(spot_id)])
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentsBySpot = (req, res, next) => {
  const { spot_id } = req.params;

  fetchSpotBySpotId(spot_id)
    .then(() => {
      return insertCommentBySpot(spot_id, req.body);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  removeCommentById(comment_id)
    .then((comment) => {
      res.status(204).send();
    })
    .catch(next);
};

exports.patchCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_upvotes, inc_downvotes } = req.body;

  updateCommentById(comment_id, inc_upvotes, inc_downvotes)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};
