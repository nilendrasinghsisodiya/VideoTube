import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, query, sortBy="createdAt", sortType="asc", userId } = req.query;

    // Set up the filter object
    const filter = {};
    if (query) {
      filter.title = { $regex: query, $options: "i" };
    }
    if (userId) {
      filter.userId = userId;
    }

    const pageNum = parseInt(page);
    const pageLimit = parseInt(limit);

    // Set up sorting order
    let sortOrder;
    if (sortType) {
      sortOrder = sortType === "asc" ? 1 : -1;
    }
    const sortObj = sortBy ? { [sortBy]: sortOrder } : {}; // Default to no sorting

    // Aggregation pipeline
    const aggregateQuery = [
      { $match: filter }, // Apply the filter
      { $sort: sortObj }, // Apply sorting
      { $skip: (pageNum - 1) * pageLimit }, // Pagination: Skip based on page number
      { $limit: pageLimit }, // Pagination: Limit based on page size
    ];

    // Pagination options
    const options = {
      page: pageNum,
      limit: pageLimit,
      customLabels: {
        docs: "videos",
        totalDocs: "totalVideos",
        totalPages: "totalPages",
        page: "currentPage",
      },
    };

    // Apply pagination
    const result = await Video.aggregatePaginate(aggregateQuery, options);
    if (!result) {
      throw new ApiError(500, "Failed to fetch videos");
    }

    return res.status(200).json(new ApiResponse(200, result, "Videos fetched successfully"));
  } catch (err) {
    throw new ApiError(500, err.message);
  }
});


const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video

    // step 1 : check if user is logged in
    // step 2: check if video thumbnail description and title is provided
    // step 3: upload video and thumanail to cloudinary
    // setp 4: check if upload is successfull
    // step 5: create a new videoDoc
    // step 6: return res with video obj
    const userId = req?.user;
    if (!userId) {
      throw new ApiError(400, "You need to be logged In to Publish a video");
    }

    if (!title || !description) {
      throw new ApiError(400, "video title and description is required");
    }
  console.log("req.files : ",req.files);
    const videoLocalpath = req?.files?.videoFile[0]?.path;
    console.log("Video loacalPath : ",videoLocalpath);
   

    const videoThumbnailLocalPath = req?.files?.thumbnail[0]?.path;
    console.log("Thumbnail localPath : ",videoThumbnailLocalPath);

    if (!videoLocalpath) {
      throw new ApiError(
        500,
        "no video found or something went wrong while uploading the file"
      );
    }
    if (!videoThumbnailLocalPath) {
      throw new ApiError(400, "no thumbnail provided");
    }
    const videoUrl = await uploadOnCloudinary(videoLocalpath);
    if (!videoUrl) {
      throw new ApiError(
        500,
        "something went wrong while uploading video to cloundinary"
      );
    }

    const thumbnailUrl = await uploadOnCloudinary(videoThumbnailLocalPath);
    if (!thumbnailUrl) {
      throw new ApiError(
        500,
        "something went wrong while uploading thumbnail to cloudinary"
      );
    }
    console.log("videoUrl obj : ",videoUrl);
    const video = await Video.create({
      videoFile: videoUrl?.url,
      title: title,
      thumbnail:thumbnailUrl?.url,
      description,
      owner: userId,
      duration: videoUrl?.duration,
    });

    if (!video) {
      throw new ApiError(500, "something went wrong while creating video doc");
    }

    console.log("video doc : ",video);

    return res
      .status(200)
      .json(new ApiResponse(200, video, "videoUploaderSuccessfully"));
  } catch (error) {
    console.log(error);

    throw new ApiError(200, error.message);
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  const isValidId = isValidObjectId(videoId);
  if (!isValidId) {
    throw new ApiError(400, "invalid videoId");
  }
  const video = await Video.findByIdAndUpdate(
    {_id: videoId},
    {
    $inc:{views:1}
  },
{new : true});
const userId = req?.user._id;

if (userId) {
  const result = await User.findByIdAndUpdate({_id: userId},
    {$addToSet:{
      watchHistory:videoId
    }}
  );
  if(!result){
    throw new ApiError(500,"failed to add video to the user watch history");
  }
}
  if (!video) {
    throw new ApiError(400, "Invalid videoId or the video does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Fetched successfully "));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  const isOwner = video.isOwner(req?.user._id);
  if (!isOwner) {
    throw new ApiError(400, "you have to be owner to update the video details");
  }
  const { title, description } = req.body;
  console.log("req.body : ",req.body);
  console.log("req.file",req.file);
  const thumbnailLocalPath = req?.file?.path; // Adjust to match file upload structure
  let updatedThumbnailLink = null;

  // Upload thumbnail to Cloudinary if provided
  if (thumbnailLocalPath) {
    updatedThumbnailLink = await uploadOnCloudinary(thumbnailLocalPath);
    console.log(updatedThumbnailLink);
    if (!updatedThumbnailLink) {
      throw new ApiError(500, "Failed to upload new thumbnail to Cloudinary");
    }
  }

  // Create update data with only non-null fields
  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (updatedThumbnailLink) updateData.thumbnail = updatedThumbnailLink?.url;

  // Check if there’s at least one field to update
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No details provided for update");
  }

  // Perform a single database update operation
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateData },
    { new: true }
  );
  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "video does not exist");
  }
  const isOwner = video.isOwner(req?.user._id);
  if (!isOwner) {
    throw new ApiError(400, "You have to be owner to delete a video");
  }

  const deletedRes = await Video.findByIdAndDelete(videoId );
  console.log(deletedRes);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted successfully"));

  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  const isOwner = video.isOwner(req?.user._id);

  if (!isOwner) {
    throw new ApiError(
      400,
      "You have to be logged In and be the Owner of the Video to change publish settings"
    );
  }
  const updatedVideo = await Video.findOneAndUpdate(
    {_id: videoId},
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { new: true }
  );
  if (!updatedVideo) {
    throw new ApiError(400, "video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "publish status updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
