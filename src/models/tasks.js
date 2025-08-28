const mongoose = require('mongoose');

// Task Schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create Task model
const Task = mongoose.model('Task', taskSchema);

// Create a new task
const createTask = async (taskData) => {
  // The validation is now handled in the routes using validateTaskCreate
  // This function expects already validated data
  const task = new Task(taskData);
  return await task.save();
};

// Get all tasks
const getAllTasks = async () => {
  return await Task.find({});
};

// Get tasks by user ID
const getTasksByUserId = async (userId) => {
  return await Task.find({ userId });
};

// Get task by ID
const getTaskById = async (id) => {
  return await Task.findById(id);
};

// Update task by ID
const updateTaskById = async (id, updateData) => {
  // The validation is now handled in the routes using validateTaskUpdate
  // This function expects already validated data
  return await Task.findByIdAndUpdate(
    id, 
    updateData, 
    { new: true, runValidators: true }
  );
};

// Delete task by ID
const deleteTaskById = async (id) => {
  return await Task.findByIdAndDelete(id);
};

// Delete all tasks by user ID
const deleteTasksByUserId = async (userId) => {
  return await Task.deleteMany({ userId });
};

// Get task count
const getTaskCount = async () => {
  return await Task.countDocuments({});
};

// Get task count by user ID
const getTaskCountByUserId = async (userId) => {
  return await Task.countDocuments({ userId });
};

module.exports = {
  Task,
  createTask,
  getAllTasks,
  getTasksByUserId,
  getTaskById,
  updateTaskById,
  deleteTaskById,
  deleteTasksByUserId,
  getTaskCount,
  getTaskCountByUserId
};
