const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "avatars",
    public_id: `avatar-${req.user.id}-${Date.now()}`,
    allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
    transformation: [
      { width: 300, height: 300, crop: "fill" },
    ],
  }),
});


const uploadAvatar = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false); // ✅
    }
    cb(null, true);
  },
});

module.exports = uploadAvatar;
