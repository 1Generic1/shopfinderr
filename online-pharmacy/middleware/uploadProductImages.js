import multer from 'multer';
import path from 'path';

const productStorage = multer.diskStorage({
  destination: './uploads/products_images',
  filename: (req, file, cb) => {
    console.log("Request Body in Multer:", req.body); // Debugging

    const productName = req.body.name || "product"; // Default if undefined
    cb(null, `${productName}-${Date.now()}${path.extname(file.originalname)}`);
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

const uploadProductImages = multer({
  storage: productStorage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).array('images', 5); // Expects files in the "images" field

export default uploadProductImages;
