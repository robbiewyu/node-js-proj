const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create User model
const User = mongoose.model('User', userSchema);

// Helper functions to maintain compatibility with existing code
const getUsers = async () => {
  return await User.find({}).select('-password');
};

const getUserById = async (id) => {
  return await User.findById(id);
};

const getUserByEmail = async (email) => {
  return await User.findOne({ email: email.toLowerCase() });
};

const addUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

module.exports = {
  User,
  getUsers,
  getUserById,
  getUserByEmail,
  addUser
};
