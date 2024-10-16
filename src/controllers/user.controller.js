import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  // get user details

  // validation -not empty
  // check if exists _ username, email
  // check if avtar and coverimage
  // upload them to cloudinary
  // put limits to register
  //create user object - create entry n db
  // remove password  and refresh token field from response
  // check for user creation
  // return res

  const { fullname, username, email, password } = req.body;
  console.log("email: ", email);

  if (
    [fullname, email.username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "somefields are empty");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username exists");
  }
  console.log("user Check ",existedUser);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  
let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.file.coverImage[0].length > 0){
  coverImageLocalPath = req.files.coverImage[0]?.path
}
  console.log(req.files, avatarLocalPath, coverImageLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file needed");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log( "avatar upload result on cloudinary : ", avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("coverImage upload result : ",coverImage)
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage.url,
    email,
    password,
    username: username.toLowerCase(),
  });

  const userExist = await User.findById(user._id).select(
    "-password -refreshToken -watchHistory"
  );

  if (!userExist) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
   console.log("userCreated with data: ", userExist);
  return res
    .status(201)
    .json(new ApiResponse(200, userExist, "User created Succesfully"));
});

export { registerUser };
