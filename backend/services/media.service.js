const { APP_CONFIG } = require("../config/app.config");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const imageKit = require("imagekit");
const AppError = require("../utils/appError");
const { IMAGEKIT_ENDPOINT_URL, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY } =
  APP_CONFIG;
const { imageKitPayloadBuilder } = require("../utils/media.util");

// register or make image kit instance
var imagekit = new imageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_ENDPOINT_URL,
});

/**
 * Uploads a file or multiple files to ImageKit.
 * @param {Array} files - Array of file payloads and folder name.
 * @returns {Object} - Uploaded file URLs and IDs.
 */
async function upload(files) {
  if (!files || !files.image) {
    throw new AppError("No file uploaded", 400);
  }

  const uploadedFiles = Array.isArray(files.image)
    ? files.image
    : [files.image];
  const folder = "/test";

  const uploadPayload = uploadedFiles.map(function (file) {
    // //check size firstly ...
    // if(file.size>APP_CONFIG.MAX_FILE_SIZE){
    //   res.status(APP_CONFIG.HTTP_BAD_REQUEST).json({message:"file size exeed limit size [5M]"});
    // }
    return imageKitPayloadBuilder(file, folder);
  });

  const uploadPromises = uploadPayload.map((file) =>
    imagekit.upload({
      file: Buffer.from(file.src),
      fileName: file.fileName,
      folder: file.folder, // Store in a specific folder
    })
  );

  const uploadResults = await Promise.all(uploadPromises);

  return {
    message: "Upload successful!",
    files: uploadResults.map(({ fileId, url }) => ({ fileId, url })),
  };
}

/**
 * Downloads a file from the given URL and saves it locally.
 * @param {string} fileUrl - The URL of the file to download.
 * @returns {Object} - An object containing a success message and the local file path.
 */
async function download(fileUrl) {
  if (!fileUrl) {
    throw new AppError("File URL is required", 400);
  }

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
}

/**
 * Deletes a file from ImageKit using its file ID.
 * @param {string} fileId - The ID of the file to delete.
 * @returns {Object} - An object with a success message.
 */
async function deleteFile(fileId) {
  if (!fileId) {
    throw new AppError("File ID is required.", 400);
  }
  await imagekit.deleteFile(fileId);
  return { message: "success" };
}

module.exports.mediaService = {
  upload,
  download,
  deleteFile,
};
