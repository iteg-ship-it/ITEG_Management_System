const multer = require("multer");
const path = require("path");

const allowedMimeTypes = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel"
]);

const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const isValidExt = ext === ".xlsx" || ext === ".xls";
    const isValidMime = allowedMimeTypes.has(file.mimetype);

    if (isValidExt || isValidMime) {
      cb(null, true);
      return;
    }

    cb(new Error("Only Excel files (.xlsx, .xls) are allowed"), false);
  }
});

module.exports = excelUpload;
