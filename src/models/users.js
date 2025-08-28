// In-memory user storage (replace with a database in production)
const users = [];

const getUsers = () => users;
const getUserById = (id) => users.find(user => user.id === id);
const getUserByEmail = (email) => users.find(user => user.email === email);
const addUser = (user) => users.push(user);

module.exports = {
  getUsers,
  getUserById,
  getUserByEmail,
  addUser
};
