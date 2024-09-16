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
});

export default mongoose.model('User', UserSchema);
