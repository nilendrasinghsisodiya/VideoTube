import  {v2 as cloudinary} from "cloudinary"
import fs from "fs"

    // cloudinary Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUNDINARY_CLOUD_NAME , 
        api_key: process.env.CLOUNDINARY_API_KEY , 
        api_secret: process.env.CLOUNDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary = async (filePath)=>{
        try{ 
            if(!filePath) return null

             let response = await cloudinary.uploader.upload(filePath, 
                {
                    resource_type: "auto"
                }
            )
        console.log("file upoladed successfully", response.url);
        fs.unlink(filePath,(err)=>{
            if(err){
                console.error("Error while deleting file after upload", err.message);
            }
            else{
                console.log("file removed successfully after upload");
            }
        });
        return response;
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("Error removing file:", err);
                }
            });
            return null;
        }
    }
    

    export {uploadOnCloudinary}
