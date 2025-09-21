import multer from "multer";
import path from "path";
import fs from "fs";

// Define dynamic destination based on file extension
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    let folder = "./uploads/others"; // default fallback

    switch (ext) {
      case ".pdf":
        folder = "./uploads/pdfs";
        break;
      case ".jpg":
      case ".jpeg":
      case ".png":
        folder = "./uploads/images";
        break;
      case ".doc":
      case ".docx":
        folder = "./uploads/docs";
        break;
    }

    // Ensure directory exists before saving
    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}${ext}`);
  },
});

const uploader = multer({ storage });

// helper for single file uploads that returns the full path
const uploadSingle = (fieldname) => {
  return (req, res, next) => {
    uploader.single(fieldname)(req, res, (err) => {
      if (err) return next(err);

      if (req.file) {
        // Multer gives us the full path
        req.fullFilePath = req.file.path; 
      }
      next();
    });
  };
};

export { uploadSingle };
