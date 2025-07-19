const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");
const { format } = require("date-fns");
const cron = require("node-cron");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3001;
const ImageStorage = require("./image");

// Initialize with your uploads directory
const imageStorage = new ImageStorage("uploads");
// Store temporary URLs and their expiration times
const tempUrls = new Map();

// Configure CORS
app.use(
  cors({
    origin: [
      "https://ocean00.com",
      "https://www.ocean00.com",
      "https://image.ocean00.com",
      "https://app.ocean00.com",
      "http://localhost:3000",
      "http://localhost:3001", // Add your development port
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// If you're uploading files, also add:
app.use(express.raw({ limit: "50mb" }));

// Set timeout
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Optionally restart the process
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

app.use("/uploads", express.static("uploads"));

const ensureUploadDir = (dirname) => {
  const uploadPath = path.join(__dirname, `uploads${dirname}`);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    fs.chmod(uploadPath, 0o777); // Fixed: Changed 'p' to 'uploadPath'
  }
  return uploadPath;
};

// API Routes
app.post("/api/saveImage", async (req, res) => {
  try {
    const { image, type, username } = req.body;
    let paths, filenames;

    switch (type) {
      case "leave":
        paths = "leave";
        filenames = `${username}-${format(new Date(), "dd-MM-yyyy")}`;
        break;
      case "user":
        paths = "user";
        filenames = username;
        break;
      case "clock":
        const formatted3 = format(new Date(), "dd-MM-yyyy");
        paths = `clock/${formatted3}`;
        filenames = username;
        break;
      default:
        break;
    }

    const result = await imageStorage.saveImage(image, {
      width: 1200,
      quality: 80,
      format: "webp",
      subDirectory: paths,
      filename: filenames,
    });

    if (result.success) {
      console.log(result.success);
      res.status(201).json({ url: result.fileInfo.url });
    } else {
      console.log(result.error);
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "error uploading file" });
  }
});

// Attendance check endpoint
app.post("/api/checkattend", async (req, res) => {
  try {
    // Implement your attendance checking logic here
    // This is where you'll put the code that runs when the cron job hits this endpoint
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Running attendance check`);

    // Add your attendance checking logic here

    res
      .status(200)
      .json({ message: "Attendance check completed successfully" });
  } catch (error) {
    console.error(`Error in attendance check: ${error.message}`);
    res.status(500).json({ error: "Failed to complete attendance check" });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({ success: "success" });
});

// Schedule cron job to run at 9 PM daily
// cron.schedule(
//   "0 16 * * *",
//   async () => {
//     const timestamp = new Date().toISOString();
//     try {
//       // First API call
//       const response = await axios.post("http://ocean00.com/api/cron", {}, );
//       console.log(
//         `[${timestamp}] Scheduled attendance check completed:`,
//         response.data
//       );
      
//       // Second API call
//       const response2 = await axios.post("http://ocean00.com/api/cron/check", {},);
//       console.log(
//         `[${timestamp}] Scheduled check verification completed:`,
//         response2.data
//       );
      
//     } catch (error) {
//       // More detailed error logging
//       if (error.response) {
//         // The server responded with a status code outside the 2xx range
//         console.error(
//           `[${timestamp}] Server error in scheduled job:`,
//           error.response.status,
//           error.response.data
//         );
//       } else if (error.request) {
//         // The request was made but no response was received
//         console.error(
//           `[${timestamp}] No response received from server:`,
//           error.request._currentUrl,
//           error.message
//         );
//       } else {
//         // Something else happened in setting up the request
//         console.error(
//           `[${timestamp}] Error in scheduled attendance check:`,
//           error.message
//         );
//       }
//     }
//   },
//   {
//     timezone: "Asia/Kuala_Lumpur",
//   }
// );
// cron.schedule(
//   "0 4 * * *", // This line is changed
//   async () => {
//     const timestamp = new Date().toISOString();
//     try {
//       const response = await axios.post(
//         "http://ocean00.com/api/cron/yesterday"
//       );
//       console.log(
//         `[${timestamp}] Scheduled attendance check completed:`,
//         response.data
//       );
//     } catch (error) {
//       console.error(
//         `[${timestamp}] Error in scheduled attendance check:`,
//         error.message
//       );
//     }
//   },
//   {
//     timezone: "Asia/Kuala_Lumpur",
//   }
// );

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log("Cron job scheduled for attendance check at 9 PM daily");
});
