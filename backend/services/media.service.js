// const { APP_CONFIG } = require("../config/app.config");
// const ImageKit = require("imagekit");
// const { IMAGEKIT_ENDPOINT_URL, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY } =
//   APP_CONFIG;

// // register or make image kit instance
// var imagekit = new ImageKit({
//   publicKey: IMAGEKIT_PUBLIC_KEY,
//   privateKey: IMAGEKIT_PRIVATE_KEY,
//   urlEndpoint: IMAGEKIT_ENDPOINT_URL,
// });

// // upload
// async function upload({ files }) {
//   try {
//     if (Array.isArray(files)) {
//       const promises = [];
//       for (const f of files) {
//         const imagekitFileParam = Buffer.from(f.src);
//         promises.push(
//           imagekit.upload({
//             file: imagekitFileParam,
//             fileName: f.fileName,
//           })
//         );
//       }

//       const resolvedPromises = await Promise.all(promises);
//       const filesIds = resolvedPromises.map((promise) => promise.fileId);
//       //await Promise.all(promises).then((res) => console.log(res));
//       return { message: "success", filesIds };
//     } else {
//       throw new Error("Upload failed due to invalid parameter!");
//     }
//   } catch (error) {
//     console.log({
//       info: "Error while uploading file",
//       error,
//       message: error?.message,
//     });
//   }
// }
// // generate url
// // download
// async function download(fileId) {
//   try {
//     const fileDetails = await imagekit.getFileDetails(fileId);
//     return { message: "success", url: fileDetails.url };
//   } catch (err) {
//     console.error(err);
//     return { message: "error" };
//   }
// }

// async function deleteFile(fileId) {
//   try {
//     await imagekit.deleteFile(fileId);
//     return { message: "success" };
//   } catch (error) {
//     console.error(error);
//   }
// }

// module.exports.mediaService = {
//   upload,
//   download,
//   deleteFile,
// };
