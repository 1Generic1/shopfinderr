import express from 'express'
import connectDB from './config/db.js';
import userRoutes from './routes/users.js';
//import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import categoryRoutes from './routes/category.js';
import cartRoutes from './routes/cartRoutes.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs'
import cors from 'cors'; //to allow integration from front end to backend
import wishlistRoutes from './routes/wishlistRoutes.js';
import productRoutes from './routes/productRoutes.js';
import variantRoutes from './routes/variantRoutes.js';
import subVariantRoutes from './routes/subVariantRoutes.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true // If you need to allow credentials (e.g., cookies)
}));


connectDB();

//Error Logging: Add logging in your backend to inspect the requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});


// Init Middleware
app.use(express.json({ extended: false }));

// Load the OpenAPI document
const openapiDocument = YAML.load('./docs/openapi.yaml');

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, {
  swaggerOptions: {
    requestInterceptor: (req) => {
      req.headers.Authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjY2MzE1OGEyNDdmYWFkYjE5MWFjZWY4In0sImlhdCI6MTcxNzc2OTYxMSwiZXhwIjoxNzE4MTI5NjExfQ.ih2OFkdL36rLUm1p5bVZUG6TjDiOmHT7-Oa3_WKBaZs'
      return req;
    }
  }
}));

app.use('/uploads', express.static('uploads'));

// Define Routes
app.use('/api/users', userRoutes);
//app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variant', variantRoutes);
app.use('/api/subVariant', subVariantRoutes);

app.listen(3001, () => {
	console.log('server is running on port 3001');
});
