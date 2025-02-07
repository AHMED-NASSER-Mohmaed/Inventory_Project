// const path = require("path");

// module.exports.imageKitPayloadBuilder = (
//   expressUploadedFile,
//   fileType = "other"
// ) => {
//   const originalExtension = path.extname(expressUploadedFile.name);
//   const originalName = path.basename(
//     expressUploadedFile.name,
//     originalExtension
//   );

//   // Renaming the file in temp directory with the correct extension
//   const newFileName = originalName + originalExtension;
//   return {
//     fileName: newFileName,
//     src: expressUploadedFile?.data,
//     type: fileType,
//   };
// };

const path = require("path");

/**
 * Builds the payload required for ImageKit upload.
 * @param {Object} expressUploadedFile - The file uploaded via express-fileupload.
 * @param {string} folder - The folder in ImageKit where the file will be stored.
 * @returns {Object} - File payload for ImageKit.
 */
module.exports.imageKitPayloadBuilder = (expressUploadedFile, folder = "/") => {
  const originalExtension = path.extname(expressUploadedFile.name);
  const originalName = path.basename(
    expressUploadedFile.name,
    originalExtension
  );
  const newFileName = `${originalName}${originalExtension}`;

  return {
    fileName: newFileName,
    src: expressUploadedFile.data, // Binary data of the file
    folder, // Folder to store the file in ImageKit
  };
};
