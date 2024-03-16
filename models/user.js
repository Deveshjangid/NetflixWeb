const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
    trim: true, // Remove leading/trailing whitespace
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  userProfile: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
  },
  // You can add more fields as needed
  // Example: role, dateOfBirth, etc.
});


// Create a User model based on the userSchema
const User = mongoose.model('User', userSchema);

module.exports = { User };
