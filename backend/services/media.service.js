const { APP_CONFIG } = require("../config/app.config");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const imageKit = require("imagekit");
const { imageKitPayloadBuilder } = require("../utils/media.util");
const AppError = require("../utils/appError");
const { IMAGEKIT_ENDPOINT_URL, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY } =
  APP_CONFIG;

// register or make image kit instance
var imagekit = new imageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_ENDPOINT_URL,
});




 /**
   * Uploads an image to ImageKit and returns its URL and id .
   * @param {Array} Of IMAGES 
   * @returns {Array} OF IDS AND URLS
   */

 async function upload(files, folder) {
  try{
    
      // console.log("filess : ", files);
      
      if(!files || !files.image) 
        throw new AppError(APP_CONFIG.HTTP_NOT_FOUND, "No file uploaded.")
      
      const uploadedFiles = Array.isArray( files.image)
        ? files.image
        : [files.image];

      // const folder =folder.toLowerCase() || "/";

      const uploadPayload = uploadedFiles.map( function(file){  
        return imageKitPayloadBuilder(file, folder)
      });


      return await uploadToImageKit({ files: uploadPayload });

  }catch(err){
    throw err 
  }

}//end of uplaod image



 



/**
 * Uploads a file or multiple files to ImageKit.
 * @param {Array} files - Array of file payloads and folder name.
 * @returns {Object} - Uploaded file URLs and IDs.
 */
async function uploadToImageKit({ files }) {

  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error("Invalid file input!");
    }

    const uploadPromises = files.map((file) =>
      imagekit.upload({
        file: Buffer.from(file.src),
        fileName: file.fileName,
        folder: file.folder, // Store in a specific folder
      })
    );

    const uploadResults = await Promise.all(uploadPromises);

    return {
      files: uploadResults.map( ( { fileId, url } ) => ( { fileId, url })),
    };
    
  } catch (err) {

    throw err;
  }

}//end of upload to image kit 


/**
 * Downloads a file from the given URL and saves it locally.
 * @param {string} fileUrl - The URL of the file to download.
 * @returns {Object} - An object containing a success message and the local file path.
 */
async function download(fileUrl) {
  try {
    const response = await axios({
      url: fileUrl,
      responseType: "stream",
    });

    const fileName = path.basename(fileUrl);
    const urlParts = fileUrl.split("/");
    const folderName = urlParts[urlParts.length - 2]; // Extract folder name

    const downloadFolder = path.join(__dirname, "../downloads", folderName);
    const filePath = path.join(downloadFolder, fileName);

    // Ensure the downloads directory and subfolder exist
    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder, { recursive: true });
    }

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve({ message: "success", filePath }));
      writer.on("error", (error) => reject({ message: "error", error }));
    });
  } catch (error) {
    console.error(error);
    return { message: "error", error };
  }
}

/**
 * Deletes a file from ImageKit using its file ID.
 * @param {string} fileId - The ID of the file to delete.
 * @returns {Object} - An object with a success message.
 *//*
async function deleteFile(fileId) {
  try {
    console.log("returning from deleting process",await imagekit.deleteFile(fileId));
    return true;
  } catch (error) {
    throw new AppError( error.message , APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR );
  }
}*/


async function deleteFiles(fileIds) {
  try {
    // Delete all files in parallel and wait for completion
    await Promise.all(
      fileIds.map(async (fileId) => {
        const result = await imagekit.deleteFile(fileId);
         
      })
    );
    return true; // Return true only if all deletions succeed
  } catch (error) {
    // Throw a custom error with the original message
    throw new AppError(error.message, APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  upload,
  download,
  deleteFiles,
};
