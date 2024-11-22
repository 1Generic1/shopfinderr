import multer from 'multer';
import path from 'path';

// Set up storage engine for category images
const categoryStorage = multer.diskStorage({
  destination: './uploads/categories_images', // Store in the 'categories' folder
  filename: (req, file, cb) => {
    cb(null, `${req.body.name}-${Date.now()}${path.extname(file.originalname)}`); // Name based on category
  }
});

// Check File Type for images
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

// Initialize upload for category images
const uploadCategoryImage = multer({
  storage: categoryStorage,
  limits: { fileSize: 2000000 }, // Limit size to 2MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('image'); // Expect a field called 'image' in the form

export default uploadCategoryImage;

