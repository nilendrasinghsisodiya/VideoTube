import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router
  .route("/")
  .post(verifyJwt, addComment)
  .delete(verifyJwt, deleteComment)
  .patch(verifyJwt, updateComment);

export default router;
