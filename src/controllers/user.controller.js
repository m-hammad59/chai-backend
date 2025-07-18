import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshToken = async(userId) => {

  try {

    const user = await User.findById(userId)
    
    const accessToken = user.generateAccessToken()
   
    const refreshToken =  user.generateRefreshToken()

    user.refreshToken = refreshToken

   await user.save({ validateBeforeSave: false })

  return {accessToken, refreshToken}

  } 
  catch (error) {
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
    new ApiResponse(201, createdUser, "User registered Successfully")
  )

})


const loginUser = asyncHandler(async (req, res) => {

    const {email, username, password} = req.body

    if (!(username || email)) {
        throw new ApiError(400, "Username or Email is required")
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

    const {accessToken, refreshToken} = await generateAccessAndRefereshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
      httpOnly: true,
      secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
      new ApiResponse(200, {
        user: loggedInUser, accessToken, refreshToken
      }, "User logged in Successfully")
    )
})


  const logoutUser = asyncHandler(async(req, res) => {
     await User.findByIdAndUpdate(
        req.user._id,{
          $set: {
            refreshToken: undefined
          }
        },
        {
          new: true
        }
      )

      const options = {
      httpOnly: true,
      secure: true
    }
    return res 
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"))
  })


  const refreshAccessToken =  asyncHandler(async(req, res) => {
     
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthoirzed Request")
    }

    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if (!user) {
        throw new ApiError(401, "Invalid Refresh Token")
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Refresh token is expred or used")
      }
  
        const options = {
          httpOnly: true,
          secure: true
        }
  
        const {accessToken, newRefreshToken}= await generateAccessAndRefereshToken(user._id)
  
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)      
        .cookie("refreshToken", newRefreshToken, options)      
        .json(
          new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access Token Refreshed SuccessFully"
          )
        )
    } catch (error) {
      throw new ApiError(401, error?.message || "invalid refresh token")
    }
  })

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
}