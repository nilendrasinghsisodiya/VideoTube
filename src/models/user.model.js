import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloud url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String, // needs to enycr and decrypted
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestaps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isMOdified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAcessToken = function () {
  jwt.sign(
    {
      _id: this._id,
      email: this.email, // payload object
      username: this.username,
      fullname: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // option object
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  jwt.sign(
    {
      _id: this._id, //payload object
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      // options object
    }
  );
};

export const User = mongoose.Model("User", userSchema);