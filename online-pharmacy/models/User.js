import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },

    lastName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  userName: {
    type: String,
    required: true, 
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  profilePicture: {
    type: String, // or Buffer if you want to store the image directly in MongoDB
    default: undefined, // not to display anything when null
    //default: null
  },

    phone: {
    type: String, // Use String to store phone numbers
    default: 'N/A', // Default if not provided
  },

  gender: {
    type: String, // Could be 'Male', 'Female', 'Other', etc.
    default: 'N/A',
  },

  country: {
    type: String,
    default: 'N/A',
  },

  city: {
    type: String,
    default: 'N/A',
  },

  postalCode: {
    type: String,
    default: 'N/A',
  },

  additionalInfo: {
    type: String, // Store any other additional information
    default: 'N/A',
  },

  bio: {
    type: String, // A short biography or description
    default: 'N/A',
  },

  darkMode: { type: Boolean, default: false },

  role: { type: String, default: 'user' },
});



export default mongoose.model('User', UserSchema);
