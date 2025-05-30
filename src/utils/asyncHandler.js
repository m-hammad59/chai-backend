
// First approch for Promises and catch with higher-order function

const asyncHandler = (requestHandler) => {

   return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }

}

export {asyncHandler}



// second approch for try catch with higher-order function

// const asyncHandler = (fn) => async(req, res, next) => {
//     try {
//         await fn(req, res, next) 
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }