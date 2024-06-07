import express from 'express'
import connectDB from './config/db.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs'

const app = express();

connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Load the OpenAPI document
const openapiDocument = YAML.load('./docs/openapi.yaml');

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, {
  swaggerOptions: {
    requestInterceptor: (req) => {
      req.headers.Authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjY1OTA4MTBhMDIzZDllYTJhMDVlZDk1In0sImlhdCI6MTcxNzExMDgwMSwiZXhwIjoxNzE3NDcwODAxfQ.zV16E8LIv-IoHca9fmAVW9gHfj4f6vRk0M8z-U6wNTI'
      return req;
    }
  }
}));

// Define Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);


app.listen(3000, () => {
	console.log('server is running on port 3000');
});
