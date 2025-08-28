const userModel = require('../models/users');
const taskModel = require('../models/tasks');

async function routes(fastify, options) {
  // GET /api/debug/users - Get all users (without passwords)
  fastify.get('/users', {
    schema: {
      description: 'Get all users for debugging purposes',
      tags: ['debug'],
      response: {
        200: {
          description: 'All users retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'number' },
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Get users with passwords for debugging purposes
      const users = await userModel.User.find({});
      
      return {
        success: true,
        count: users.length,
        users: users
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // GET /api/debug/tasks - Get all tasks
  fastify.get('/tasks', {
    schema: {
      description: 'Get all tasks for debugging purposes',
      tags: ['debug'],
      response: {
        200: {
          description: 'All tasks retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'number' },
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  completed: { type: 'boolean' },
                  userId: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const tasks = await taskModel.getAllTasks();
      
      return {
        success: true,
        count: tasks.length,
        tasks: tasks
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // GET /api/debug/database-stats - Get database statistics
  fastify.get('/database-stats', {
    schema: {
      description: 'Get database statistics for debugging',
      tags: ['debug'],
      response: {
        200: {
          description: 'Database statistics retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            stats: {
              type: 'object',
              properties: {
                totalUsers: { type: 'number' },
                totalTasks: { type: 'number' },
                tasksCompleted: { type: 'number' },
                tasksPending: { type: 'number' }
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const totalUsers = await userModel.getUsers();
      const allTasks = await taskModel.getAllTasks();
      
      const tasksCompleted = allTasks.filter(task => task.completed).length;
      const tasksPending = allTasks.filter(task => !task.completed).length;
      
      return {
        success: true,
        stats: {
          totalUsers: totalUsers.length,
          totalTasks: allTasks.length,
          tasksCompleted: tasksCompleted,
          tasksPending: tasksPending
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // GET /api/debug/user/:userId/tasks - Get all tasks for a specific user
  fastify.get('/user/:userId/tasks', {
    schema: {
      description: 'Get all tasks for a specific user (debugging)',
      tags: ['debug'],
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID' }
        },
        required: ['userId']
      },
      response: {
        200: {
          description: 'User tasks retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            userId: { type: 'string' },
            count: { type: 'number' },
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  completed: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        404: {
          description: 'User not found',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.params.userId;
      
      // Check if user exists
      const user = await userModel.getUserById(userId);
      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        });
      }
      
      const tasks = await taskModel.getTasksByUserId(userId);
      
      return {
        success: true,
        userId: userId,
        count: tasks.length,
        tasks: tasks
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });
}

module.exports = routes;
