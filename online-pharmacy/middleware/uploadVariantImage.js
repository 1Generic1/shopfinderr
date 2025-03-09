import multer from 'multer';
import path from 'path';

// Set up storage engine for Variant images
const variantStorage = multer.diskStorage({
  destination: './uploads/variant_images', 
  filename: (req, file, cb) => {
    cb(null, `${req.body.name}-${Date.now()}${path.extname(file.originalname)}`); 
  }
});

// Check File Type for images (common function)
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

// Initialize upload for product images
const uploadVariantImage = multer({
  storage: variantStorage,
  limits: { fileSize: 1 * 1024 * 1024 }, // Adjust size limit as needed (e.g., 2MB for products)
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('image'); // Expecting a field called 'image' in the form

export default uploadVariantImage;


