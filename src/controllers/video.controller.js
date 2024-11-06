import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
})

const publishAVideo = asyncHandler(async (req, res) => {
   try {
     const { title, description} = req.body
     // TODO: get video, upload to cloudinary, create video

     // step 1 : check if user is logged in
     // step 2: check if video thumbnail description and title is provided
     // step 3: upload video and thumanail to cloudinary
     // setp 4: check if upload is successfull
     // step 5: create a new videoDoc
     // step 6: return res with video obj
     const userId = req?.user;
     if(!userId){
         throw new ApiError(400,"You need to be logged In to Publish a video");
     }
 
 
     if(!title || !description){
         throw new ApiError(400, "video title and description is required");
     }
 
     const videoLocalpath = req?.files?.video[0]?.path;
     console.log(videoLocalpath)
     console.log(req.files)
 
     const  videoThumbnailLocalPath = req?.files?.videoThumbnail[0]?.path
     console.log(videoThumbnailLocalPath)
 
 
     
     if(!videoLocalpath){
         throw new ApiError(500,"no video found or something went wrong while uploading the file");
     }
     if(!videoThumbnailLocalPath){ throw new ApiError(400, "no thumbnail provided")}
    const videoUrl = await uploadOnCloudinary(videoLocalpath);
     if(!videoUrl){
         throw new ApiError(500, "something went wrong while uploading video to cloundinary");
     }
 
     const thumbnailUrl = await uploadOnCloudinary(videoThumbnailLocalPath);
     if(!thumbnailUrl){throw new ApiError(500,"something went wrong while uploading thumbnail to cloudinary")}    
     const video = await Video.create({
       videoFile:videoUrl?.url,
       title: title,
       description,
       owner: userId,
       duration:videoUrl.content.length
 
 
     })
 
     if(!video){throw new ApiError(500, "something went wrong while creating video doc")};
 
     return res
     .status(200)
     .json(new ApiResponse(200,video,"videoUploaderSuccessfully"));
   } catch (error) {
    console.log(error)

    throw new ApiError(200, error.message);
    
   }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}