const commentRouter = require("express").Router();
const { deleteCommentById, patchCommentById, getAllComments } = require("../controllers/comments");

commentRouter.route("/").get(getAllComments);

commentRouter.route("/:comment_id").delete(deleteCommentById).patch(patchCommentById);

module.exports = commentRouter;
