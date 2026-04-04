import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, "../uploads/gov-ids"),
    path.join(__dirname, "../uploads/certificates"),
    path.join(__dirname, "../uploads/profiles"),
    path.join(__dirname, "../uploads/messages"),
    path.join(__dirname, "../uploads/others"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, "../uploads/");

    if (file.fieldname === "gov_id") {
      uploadPath += "gov-ids";
    } else if (file.fieldname === "certificate") {
      uploadPath += "certificates";
    } else if (file.fieldname === "profile_image") {
      uploadPath += "profiles";
    } else if (file.fieldname === "message_file") {
      uploadPath += "messages";
    } else {
      uploadPath += "others";
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes =
    /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar|mp4|mp3/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "File type not allowed. Allowed: images, PDFs, documents, archives, audio, video",
      ),
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

export default upload;
