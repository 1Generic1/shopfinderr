import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27018/online-pharmacy', {
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('COULD NOT CONNECT TO DATABASE:', err.message);
    process.exit(1);
  }
};

export default connectDB;
