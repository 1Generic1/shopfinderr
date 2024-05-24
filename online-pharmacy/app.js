import express from 'express'
const connectDB = require('./config/db');

const app = express();

connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

app.get('/', (req, res) => {
	res.json({'messege':'hello world'});
})

app.get('/user', (req, res) => {
        res.json({
		'messege':'hello world',
		'name': 'john wick'
	});
})

app.listen(3000, () => {
	console.log('server is running on port 3000');
});
