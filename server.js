const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");
const { format } = require("date-fns");
const app = express();
const port = process.env.PORT || 3001;
const ImageStorage = require("./image");

// Initialize with your uploads directory
const imageStorage = new ImageStorage("uploads");
// Store temporary URLs and their expiration times
const tempUrls = new Map();

app.use(cors());
app.use(express.json({ limit: "5mb" })); // Reduced limit since we're not handling base64
app.use("/uploads", express.static("uploads"));
const ensureUploadDir = (dirname) => {
  const uploadPath = path.join(__dirname, `uploads${dirname}`);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    fs.chmod(p, 0o777);
  }
  return uploadPath;
};

app.post("/api/saveImage", async (req, res) => {
  try {
    const { image, type, username } = req.body;
    switch (type) {
      case "leave":
        var paths = "leave";
        const date = format(new Date(), "dd-MM-yyyy");
        var filenames = `${username}-${date}`;
        break;
      case "user":
        var paths = "user";
        var filenames = `${username}`;
        break;
      case "clock":
        const formatted3 = format(new Date(), "dd-MM-yyyy");
        var paths = `clock/${formatted3}`;
        var filenames = `${username}`;
        break;
      default:
        break;
    }
    // let uploadpath = ensureUploadDir(path);
    // const filepath = path.join(uploadpath, filename);
    const result = await imageStorage.saveImage(image, {
      width: 1200,
      quality: 80,
      format: "webp",
      subDirectory: paths, // Optional: organizes images in subdirectories
      filename: filenames,
    });
    if (result.success) {
      // Save the file info to your database if needed
      // result.fileInfo.url = path to access the image
      // result.fileInfo.filePath = full system path
      res.status(201).json(result.fileInfo.url);
    } else {
      res.status(400).json({ error: result.error });
    }
    // console.log(uploadpath);
    // res.status(200).json({image})
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "error uploading file" });
  }
});
app.get("/", (req, res) => {
  res.status(200).json({ success: "success" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
