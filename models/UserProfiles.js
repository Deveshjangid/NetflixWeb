const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  email: { type: String, required: false, unique: true },
  password: { type: String, required: false },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Add other profile fields as needed
});

// Create a compound unique index on email and password fields
userProfileSchema.index({ email: 1, password: 1 }, { unique: true });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = { UserProfile };