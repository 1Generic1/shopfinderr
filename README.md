# SHOPFINDER

Online Pharmacy API
An online pharmacy API that allows users to register, login, browse products, place orders, and manage their user accounts.

Table of Contents
Getting Started
Prerequisites
Installation
Running the Application
API Endpoints
Swagger Documentation
Technologies Used
Author
Getting Started
This project provides an API for an online pharmacy. It includes user authentication, product management, and order processing.

Prerequisites
Ensure you have the following installed:

Node.js
MongoDB
Installation
Clone the repository:

sh
Copy code
git clone https://github.com/your-username/online-pharmacy.git
cd online-pharmacy
Install dependencies:

sh
Copy code
npm install
Create a .env file in the root directory and add the following:

makefile
Copy code
MONGO_URI=your_mongo_database_uri
JWT_SECRET=your_jwt_secret
Running the Application
Start the server:

sh
Copy code
npm start
The server will run on http://localhost:3000.

API Endpoints
User Routes
Register a user

Endpoint: /api/users/register
Method: POST
Description: Registers a new user.
Login a user

Endpoint: /api/users/login
Method: POST
Description: Authenticates a user and returns a token.
Get user profile

Endpoint: /api/users
Method: GET
Description: Retrieves the logged-in user's profile.
Delete user account

Endpoint: /api/users/:id
Method: DELETE
Description: Deletes the logged-in user's account.
Product Routes
Get all products
Endpoint: /api/products
Method: GET
Description: Retrieves all products.
Order Routes
Create an order

Endpoint: /api/orders
	Method: POST
	Description: Creates a new order for the logged-in user.
	Get user orders

Endpoint: /api/orders
	Method: GET
	Description: Retrieves all orders for the logged-in user.
	Get order by ID

Endpoint: /api/orders/:id
	Method: GET
	Description: Retrieves a specific order by its ID.
	Update an order

Endpoint: /api/orders/:id
	Method: PUT
	Description: Updates an existing order.
	Swagger Documentation
	Swagger documentation is available for this API. You can access it at http://localhost:3000/api-docs.

Technologies Used

- Node.js: JavaScript runtime.
- Express.js: Web framework for Node.js.
- MongoDB: NoSQL database.
- Mongoose: ODM for MongoDB.
- JSON Web Tokens (JWT): For authentication.
- Swagger: For API documentation.

Author
- Generic
  
