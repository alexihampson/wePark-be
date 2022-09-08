const commentRouter = require("express").Router();
const { deleteCommentById } = require("../controllers/comments");

commentRouter.route("/:comment_id").delete(deleteCommentById);

module.exports = commentRouter;
