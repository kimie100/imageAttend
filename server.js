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
    origin: function(origin, callback) {
      const allowedOrigins = [
        /^https?:\/\/(?:.*\.)?ocean00\.com$/,  // Matches any subdomain of ocean00.com
        'http://localhost:3000'
      ];
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin matches any allowed pattern
      const allowed = allowedOrigins.some(allowed => {
        return typeof allowed === 'string' 
          ? allowed === origin
          : allowed.test(origin);
      });
      
      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 600 // Increase preflight cache time
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// If you're uploading files, also add:
app.use(express.raw({ limit: '50mb' }));

// Set timeout
server.timeout = 300000;
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
      res.status(201).json({url:result.fileInfo.url});
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
cron.schedule(
  "0 21 * * *",
  async () => {
    const timestamp = new Date().toISOString();
    try {
      const response = await axios.post("http://localhost:3001/api/cron");
      console.log(
        `[${timestamp}] Scheduled attendance check completed:`,
        response.data
      );
    } catch (error) {
      console.error(
        `[${timestamp}] Error in scheduled attendance check:`,
        error.message
      );
    }
  },
  {
    timezone: "Asia/Bangkok",
  }
);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log("Cron job scheduled for attendance check at 9 PM daily");
});
