const { APP_CONFIG } = require("../config/app.config");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const imageKit = require("imagekit");
const { IMAGEKIT_ENDPOINT_URL, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY } =
  APP_CONFIG;

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
async function upload({ files }) {
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
      message: "Upload successful!",
      files: uploadResults.map(({ fileId, url }) => ({ fileId, url })),
    };
  } catch (error) {
    console.error("Error during file upload:", error);
    return { message: "Upload failed", error: error.message };
  }
}

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
    const filePath = path.join(__dirname, "../downloads", fileName);

    // Ensure the downloads directory exists
    if (!fs.existsSync(path.join(__dirname, "../downloads"))) {
      fs.mkdirSync(path.join(__dirname, "../downloads"));
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
 */
async function deleteFile(fileId) {
  try {
    await imagekit.deleteFile(fileId);
    return { message: "success" };
  } catch (error) {
    console.error(error);
  }
}

module.exports.mediaService = {
  upload,
  download,
  deleteFile,
};
