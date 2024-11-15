import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req?.user._id;
  if (!userId) {
    throw new ApiError(400, "You need to be logged In to create a playlist");
  }

  if (!name || !description) {
    throw new ApiError(400, "Playlist name and description is required");
  }
  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: userId,
  });

  if (!playlist) {
    throw new ApiError(500, "failed to create playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist created successfully"));
  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  // needs a aggregation pipelines that searchs for userId in playlist docs an returns the matches the userId

  // take this to userController
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const isValidId = isValidObjectId(playlistId);
  if (!isValidId) {
    throw new ApiError(400, "not a valid playlistId");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(500, "failed to find the playlist");
  }
  return res.status(200).json(200, playlist, "playlist fetched successfully");
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const userId = req?.user._id;
  if (!userId) {
    throw new ApiError(400, "unauthorized access");
  }
  const { playlistId, videos } = req.body;

  const isValidPlaylistId = isValidObjectId(playlistId);
  if (!isValidPlaylistId) {
    throw new ApiError(400, "invalid Playlist id");
  }
  if (!Array.isArray(videos) || videos.length === 0) {
    throw new ApiError(400, "Invalid or empty videos array");
  }

  const validVideos = [];

  videos.forEach((element) => {
    if (isValidObjectId(element)) {
      validVideos.push(element);
    }
  });
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        videos: validVideos,
      },
    },
    {
      new: true,
    }
  );

  console.log(updatedPlaylist);
  if (!updatedPlaylist) {
    throw new ApiError(500, "failded to add vidoes to playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Videos added successfully to the playlist"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid playlist or video id");
  }
  if (!req?.user._id) {
    throw new ApiError(400, "unauthorized accesss");
  }
  const playlist = await Playlist.findById(playlistId);
  const isOwner = playlist.isOwner(req.user._id);
  if (!playlist) {
    throw new ApiError(400, "playlist does not exist");
  }
  if (!isOwner) {
    throw new ApiError(400, "Unauthorzied access");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { vidoes: videoId },
    },
    { new: true }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "failed to remove video");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatePlaylist,
        "video removed from playlist sucessfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
