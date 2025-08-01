import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken
        const refreshToken = user.generateRefreshToken

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        
        return {accessToken, refreshToken}

    }catch(err){
        throw new ApiError(500, "Something Went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async(req, res) => {
    // user details from frontend
    const {fullName, email, username, password} = req.body
    //validation
    // if(fullName === "" ){
    //     throw new ApiError(400, "full Name is required")
    // }
    if (
        [fullName, email, username, password].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    

    // user exit or not
    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })
    if(existedUser){
        throw new ApiError(409, "User is already existed")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log("avatar: ", avatarLocalPath)
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatara is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    

    if(!avatar){
        throw new ApiError(400, "Avatara is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
        
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser) {
        throw new ApiError(500, "Something wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User register sucessfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const {email, username , password} = req.body 

    if(!username || !email) {
        throw new ApiError(400, "usrname or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User doesnot exit")
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid Password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // send cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,refreshToken
            },
            "User Logged In successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },{
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

export {registerUser, loginUser, logoutUser};