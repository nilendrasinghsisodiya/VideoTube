import {Mongoose, Schema} from "mongoose";

const playlistSchema = new Schema({
    name :{
        type: String,
        required: true
    },
    description: String,
    vidoes:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

playlistSchema.methods.isOwner = function(userId){return String(this.owner)=== String(userId)};

export const Playlist = Mongoose.model("Playlist",playlistSchema);