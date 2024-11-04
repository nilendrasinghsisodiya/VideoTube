import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req?.params;
  console.log(req.params);

  if (!videoId) {
    throw new ApiError(400, "Invalid Video ID");
    console.log(req.params, req.user);
  }
  const userId  = req?.user._id;
  const like = await Like.create({
    likedBy: userId,
    video: videoId,
  });
  console.log(like);
  if (!like) {
    throw new ApiError(400, " Failed to like the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, like, "video like updated successfully"));
});


export {
  toggleVideoLike
}