import multer from 'multer';
import path from 'path';

const subVariantStorage = multer.diskStorage({
  destination: './uploads/subvariant_images',
  filename: (req, file, cb) => {
    console.log("Request Body in Multer:", req.body); // Debugging

    // Extract the original filename without extension
    const originalName = path.parse(file.originalname).name.replace(/\s+/g, '-'); // Replace spaces with hyphens

    // Append timestamp for uniqueness
    const uniqueFilename = `${originalName}-${Date.now()}${path.extname(file.originalname)}`;

    cb(null, uniqueFilename);
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

const uploadSubVariantImages = multer({
  storage: subVariantStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).array('images', 5); // Expects files in the "images" field

export default uploadSubVariantImages;

