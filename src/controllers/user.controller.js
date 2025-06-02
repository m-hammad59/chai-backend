import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"

const registerUser = asyncHandler(async(req, res) => {
  const { fullName, email, username, password }  = req.body

  console.log(email);

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

})

export {registerUser}