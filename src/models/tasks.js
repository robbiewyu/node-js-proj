// In-memory task storage (replace with a database in production)
const tasks = [];
let taskIdCounter = 1;

// Create a new task
const createTask = (taskData) => {
  // The validation is now handled in the routes using validateTaskCreate
  // This function expects already validated data
  const newTask = {
    id: taskIdCounter++,
    title: taskData.title,
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
  
  // The validation is now handled in the routes using validateTaskUpdate
  // This function expects already validated data
  
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
  getTaskCountByUserId
};
