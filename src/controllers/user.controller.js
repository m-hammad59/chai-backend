import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefereshToken = async(userId) => {

    const user = await User.findById(userId)
    
    const accessToken = user.generateAccessToken
   
   const refreshToken =  user.generateRefreshToken


  try {
    
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }

}


const registerUser = asyncHandler(async(req, res) => {
  const { fullName, email, username, password }  = req.body

  // console.log(email);

  if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
        throw new ApiError(400, "All Fields Required")
  }
  
    //await added by gpt   
   const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "Username or Email already exist")
    }

    // console.log(req.files);
    

   const avatarLocalPath = req.files?.avatar[0]?.path

  //  const coverImageLocalPath = req.files?.coverImage[0]?.path

  let coverImageLocalPath;

  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }


   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is requried")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
      throw new ApiError(400, "Avatar file is requried")
   }

   const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
   })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering a user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
  )

})


const loginUser = asyncHandler(async (req, res) => {

    const {email, username, password} = req.body

    if (!username || !email) {
        throw new ApiError(400, "Username or password is required")
    }

   const user = await User.findOne({
      $or: [{username}, {email}]
    })

    if (!user) {
      throw new ApiError(404, "user doesnot exist")
    }

  const isPasswordValid =  await user.isPasswordCorrect(password)


    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials")
    }




})


export {
  registerUser,
  loginUser
}