import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    vidoeFile: {
      type: String, // cloud url
      required: true,
    },
    thumbnail: {
      type: String, //cloud rul
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      requird: true,
    },
    duration: {
      type: Number, //cloud content info
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
