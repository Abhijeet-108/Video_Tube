import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;
        // uplaod the file to cloudinary
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        })
        // file has been uploaded to cloudinary
        // console.log("File has been uploaded to cloudinary", response.url);
        fs.unlinkSync(filePath)
        return response;
    } catch (error) {
        fs.unlinkSync(filePath); // remove localy saved temporary file
        return null;
    }
}

export { uploadOnCloudinary };

// cloudinary.v2.uploader.upload("",{},function(){})