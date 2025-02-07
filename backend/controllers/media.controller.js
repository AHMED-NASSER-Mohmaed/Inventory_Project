const { mediaService } = require("../services/media.service");
const catchAsync = require("../utils/catchAsync");
const AuthMiddleware = require("../middlewares/auth.middleware");
const { APP_CONFIG } = require("../config/app.config");

class MediaController {
  constructor() {
    this.router = require("express").Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    /**
     * if you need to post an image ---> you have to be authenticated at least
     */
    this.router.post(
      "/media/upload",
      AuthMiddleware.protect,
      catchAsync(this.upload)
    );
    //the same here
    this.router.get(
      "/media/download",
      AuthMiddleware.protect,
      catchAsync(this.download)
    );

    this.router.delete(
      "/media/delete/:fileId",
      AuthMiddleware.protect,
      AuthMiddleware.restrictTo("admin", "super_admin"),
      catchAsync(this.delete)
    );
  }

  /**
   * Uploads an image to ImageKit and returns its URL.
   */
  async upload(req, res) {
    const folder = req.url.split("/")[1];
    const response = await mediaService.upload(req.files, folder);
    res.status(200).json(response);
  }

  async download(req, res) {
    const response = await mediaService.download(req.query.url);

    if (response.message === "success") {
      res.download(response.filePath, (err) => {
        if (err) {
          res.status(500).json({ message: "Error downloading file" });
        }
      });
    } else {
      res
        .status(500)
        .json({ message: "Download failed", error: response.error });
    }
  }

  /**
   * Deletes an uploaded file from ImageKit.
   */
  async delete(req, res) {
    const response = await mediaService.deleteFile(req.params.fileId);
    res.status(200).json(response);
  }
}

/*
  router.post(
    "/upload",
    AuthMiddleware.protect,
    catchAsync(async (req, res) => {
      try {
        if (!req.files || !req.files.image) {
          return res.status(400).json({ message: "No file uploaded." });
        }

        const uploadedFiles = Array.isArray(req.files.image)
          ? req.files.image
          : [req.files.image];
        const folder = "/user-uploads"; // Change folder as needed

        const uploadPayload = uploadedFiles.map((file) =>
          imageKitPayloadBuilder(file, folder)
        );
        const response = await upload({ files: uploadPayload });

        res.status(200).json(response);
      } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    })
  );

  router.get("/media/download/:fileId", async (req, res, next) => {
    const fileId = req.params.fileId;
    if (!fileId) {
      return res.status(400).json({ message: "File id is required" });
    }

    const response = await mediaService.download(fileId);
    res
      .status(200)
      .json({ message: response.message, fileURL: response.url || "" });
  });

  router.delete("/media/delete/:fileId", async (req, res, next) => {
    const fileId = req.params.fileId;
    if (!fileId) {
      return res.status(400).json({ message: "File id is required" });
    }

    await mediaService.deleteFile(fileId);
    res.status(200).json({ message: "success" });
  });
*/
module.exports = new MediaController().router;
