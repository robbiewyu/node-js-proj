// In-memory task storage (replace with a database in production)
const tasks = [];
let taskIdCounter = 1;

// Task validation function
const validateTask = (taskData) => {
  const errors = [];
  
  if (!taskData.title || typeof taskData.title !== 'string' || taskData.title.trim() === '') {
    errors.push('Title is required and must be a non-empty string');
  }
  
  if (taskData.description !== undefined && typeof taskData.description !== 'string') {
    errors.push('Description must be a string');
  }
  
  if (taskData.completed !== undefined && typeof taskData.completed !== 'boolean') {
    errors.push('Completed must be a boolean');
  }
  
  if (!taskData.userId || typeof taskData.userId !== 'number') {
    errors.push('UserId is required and must be a number');
  }
  
  return errors;
};

// Create a new task
const createTask = (taskData) => {
  const errors = validateTask(taskData);
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  
  const newTask = {
    id: taskIdCounter++,
    title: taskData.title.trim(),
    description: taskData.description || '',
    completed: taskData.completed || false,
    userId: taskData.userId,
    createdAt: taskData.createdAt || new Date()
  };
  
  tasks.push(newTask);
  return newTask;
};

// Get all tasks
const getAllTasks = () => tasks;

// Get tasks by user ID
const getTasksByUserId = (userId) => {
  return tasks.filter(task => task.userId === userId);
};

// Get task by ID
const getTaskById = (id) => {
  return tasks.find(task => task.id === id);
};

// Update task by ID
const updateTaskById = (id, updateData) => {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return null;
  }
  
  const currentTask = tasks[taskIndex];
  
  // Validate only the fields being updated
  const fieldsToValidate = {};
  if (updateData.title !== undefined) fieldsToValidate.title = updateData.title;
  if (updateData.description !== undefined) fieldsToValidate.description = updateData.description;
  if (updateData.completed !== undefined) fieldsToValidate.completed = updateData.completed;
  if (updateData.userId !== undefined) fieldsToValidate.userId = updateData.userId;
  
  // Only validate if we have fields to validate and they include required fields
  if (Object.keys(fieldsToValidate).length > 0) {
    const validationData = { ...currentTask, ...fieldsToValidate };
    const errors = validateTask(validationData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }
  
  // Update the task
  const updatedTask = {
    ...currentTask,
    ...updateData,
    id: currentTask.id, // Ensure ID cannot be changed
    createdAt: currentTask.createdAt // Ensure createdAt cannot be changed
  };
  
  tasks[taskIndex] = updatedTask;
  return updatedTask;
};

// Delete task by ID
const deleteTaskById = (id) => {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return null;
  }
  
  const deletedTask = tasks[taskIndex];
  tasks.splice(taskIndex, 1);
  return deletedTask;
};

// Delete all tasks by user ID
const deleteTasksByUserId = (userId) => {
  const userTasks = tasks.filter(task => task.userId === userId);
  const remainingTasks = tasks.filter(task => task.userId !== userId);
  tasks.length = 0;
  tasks.push(...remainingTasks);
  return userTasks;
};

// Get task count
const getTaskCount = () => tasks.length;

// Get task count by user ID
const getTaskCountByUserId = (userId) => {
  return tasks.filter(task => task.userId === userId).length;
};

module.exports = {
  createTask,
  getAllTasks,
  getTasksByUserId,
  getTaskById,
  updateTaskById,
  deleteTaskById,
  deleteTasksByUserId,
  getTaskCount,
  getTaskCountByUserId,
  validateTask
};
