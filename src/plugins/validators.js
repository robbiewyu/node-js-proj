const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

/**
 * Centralized validation functions for business logic
 */

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const isValidString = (value, minLength = 1, maxLength = Infinity) => {
  return typeof value === 'string' && 
         value.trim().length >= minLength && 
         value.trim().length <= maxLength;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
};

const isValidBoolean = (value) => {
  return typeof value === 'boolean';
};

const isValidNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && value > 0;
};

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// =============================================================================
// CUSTOM VALIDATION ERROR
// =============================================================================

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.isValidationError = true;
  }
}

const isValidationError = (error) => {
  return error && error.isValidationError === true;
};

// =============================================================================
// USER VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates and sanitizes user registration data
 */
const validateUserRegistration = (userData) => {
  const errors = [];
  
  if (!isValidEmail(userData.email)) {
    errors.push('Valid email is required');
  }
  
  if (!isValidString(userData.password, 6)) {
    errors.push('Password is required and must be at least 6 characters');
  }
  
  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }
  
  return {
    email: userData.email.trim().toLowerCase(),
    password: userData.password,
    createdAt: new Date()
  };
};

/**
 * Validates and sanitizes user login data
 */
const validateUserLogin = (loginData) => {
  const errors = [];
  
  if (!isValidEmail(loginData.email)) {
    errors.push('Valid email is required');
  }
  
  if (!isValidString(loginData.password, 1)) {
    errors.push('Password is required');
  }
  
  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }
  
  return {
    email: loginData.email.trim().toLowerCase(),
    password: loginData.password
  };
};

/**
 * Checks if user already exists by email
 */
const checkUserExists = async (userModel, email) => {
  const existingUser = await userModel.getUserByEmail(email);
  
  if (existingUser) {
    throw new ValidationError('User with this email already exists');
  }
};

/**
 * Validates user credentials for login
 */
const validateUserCredentials = async (userModel, email, password) => {
  const user = await userModel.getUserByEmail(email);
  
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }
  
  return user;
};

/**
 * Hashes a password
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// =============================================================================
// TASK VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates and sanitizes task creation data
 */
const validateTaskCreate = (taskData, userId) => {
  const errors = [];
  
  if (!isValidString(taskData.title, 1, 200)) {
    errors.push('Title is required and must be between 1-200 characters');
  }
  
  if (taskData.description !== undefined && !isValidString(taskData.description, 0, 1000)) {
    errors.push('Description must be a string with max 1000 characters');
  }
  
  if (taskData.completed !== undefined && !isValidBoolean(taskData.completed)) {
    errors.push('Completed must be a boolean');
  }
  
  if (!isValidObjectId(userId)) {
    errors.push('Valid user ID is required');
  }
  
  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }
  
  return {
    title: taskData.title.trim(),
    description: taskData.description || '',
    completed: taskData.completed || false,
    userId: userId
  };
};

/**
 * Validates and sanitizes task update data
 */
const validateTaskUpdate = (taskData) => {
  const errors = [];
  
  // Check if at least one field is provided
  if (!taskData.title && !taskData.description && taskData.completed === undefined) {
    errors.push('At least one field (title, description, or completed) must be provided');
  }
  
  if (taskData.title !== undefined && !isValidString(taskData.title, 1, 200)) {
    errors.push('Title must be between 1-200 characters');
  }
  
  if (taskData.description !== undefined && !isValidString(taskData.description, 0, 1000)) {
    errors.push('Description must be a string with max 1000 characters');
  }
  
  if (taskData.completed !== undefined && !isValidBoolean(taskData.completed)) {
    errors.push('Completed must be a boolean');
  }
  
  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }
  
  const updateData = {};
  if (taskData.title !== undefined) updateData.title = taskData.title.trim();
  if (taskData.description !== undefined) updateData.description = taskData.description;
  if (taskData.completed !== undefined) updateData.completed = taskData.completed;
  
  return updateData;
};

/**
 * Validates task ownership and existence
 */
const validateTaskOwnership = (task, userId) => {
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }
  
  if (task.userId.toString() !== userId.toString()) {
    const error = new Error('Access denied: You can only access your own tasks');
    error.statusCode = 403;
    throw error;
  }
  
  return task;
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // User validators
  validateUserRegistration,
  validateUserLogin,
  checkUserExists,
  validateUserCredentials,
  hashPassword,
  
  // Task validators
  validateTaskCreate,
  validateTaskUpdate,
  validateTaskOwnership,
  
  // Utilities
  isValidationError,
  ValidationError
};
