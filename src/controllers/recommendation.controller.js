import { Video } from "../models/video.model";
import { User } from "../models/user.model";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUserRecommendation = asyncHandler(async (req, res) => {
    
});

const getRelatedVideos = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const pageLimit = Number(limit);
  const pageNum = Number(page);
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid object id");
  }
  const video = Video.findById(videoId);

  // can be done with video.find but is less fesiable and can be more customized
  // can add a title matching system but would need to design it first 
  //possible steps
  // 1. split the title by space
  // 2. to be implemented {remove comman words such what to  and who , others
  // 3. maybe a llm can be used
  // 4. match by those remaining words using regex
  // 5. should be case insesitive}
  // 6. after that we should do tag based matching which is straight forward and assign weights to videos with more tags matched
  

  const aggregationQuerry = [
    {
      $match: {
        _id: { $ne: video._id }, // Exclude the given video
        tags: { $in: tags }, // Match any tags that exist in the given video’s tags
      },
    },
    {$addFields:{
        $size:{
            $filter:{
                input:"tags",
                as:"tag",
                cond: { 
                    $in: ["$$tag", "$tags"] 
                  }
            }
        }
    }},
    {
      $project: {
        _id: 1,
        thumbnail: 1,
        createdAt: 1,
        views: 1,
      },
    },
    { $skip: (pageNum - 1) * pageLimit },
    { $limit: pageLimit },
  ];
  const options = {
    page:pageNum,
    limit:pageLimit,
    customLabels:{
        docs:"related videos",
        totalDocs:"total related videos",
        totalPages: "total pages",
      page: "current page",
    }
};
const relatedVideos = await Video.aggregatePaginate(aggregationQuerry,options);
if(!relatedVideos){
    throw new ApiError(500,"failed to fetch related videos");

}
return res.status(200).json(new ApiResponse(200,relatedVideos,"related vidoes fetched successfully"));
});

export { getUserRecommendation, getRelatedVideos };
