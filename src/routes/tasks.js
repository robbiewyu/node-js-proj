const { verifyToken } = require('../middleware/auth');
const taskModel = require('../models/tasks');

async function routes(fastify, options) {
  // GET /api/tasks - Get all user's tasks
  fastify.get('/', {
    preHandler: verifyToken,
    schema: {
      description: 'Get all tasks for the authenticated user',
      tags: ['tasks'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Successful response',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  completed: { type: 'boolean' },
                  userId: { type: 'number' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized',
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
      const tasks = taskModel.getTasksByUserId(request.user.userId);
      return {
        success: true,
        tasks
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // POST /api/tasks - Create a new task
  fastify.post('/', {
    preHandler: verifyToken,
    schema: {
      description: 'Create a new task',
      tags: ['tasks'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 1000 },
          completed: { type: 'boolean' }
        }
      },
      response: {
        201: {
          description: 'Task created successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            task: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                completed: { type: 'boolean' },
                userId: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        400: {
          description: 'Bad request',
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
      const { title, description, completed } = request.body;
      
      const newTask = taskModel.createTask({
        title,
        description,
        completed,
        userId: request.user.userId
      });

      return reply.status(201).send({
        success: true,
        message: 'Task created successfully',
        task: newTask
      });

    } catch (error) {
      if (error.message.includes('Validation failed')) {
        return reply.status(400).send({
          success: false,
          message: error.message
        });
      }
      
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // PUT /api/tasks/:id - Update a task
  fastify.put('/:id', {
    preHandler: verifyToken,
    schema: {
      description: 'Update a task by ID',
      tags: ['tasks'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Task ID' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 1000 },
          completed: { type: 'boolean' }
        }
      },
      response: {
        200: {
          description: 'Task updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            task: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                completed: { type: 'boolean' },
                userId: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        404: {
          description: 'Task not found',
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
      const taskId = parseInt(request.params.id);
      const updateData = request.body;

      // Check if task exists and belongs to the user
      const existingTask = taskModel.getTaskById(taskId);
      if (!existingTask) {
        return reply.status(404).send({
          success: false,
          message: 'Task not found'
        });
      }

      if (existingTask.userId !== request.user.userId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied: You can only update your own tasks'
        });
      }

      const updatedTask = taskModel.updateTaskById(taskId, updateData);

      return {
        success: true,
        message: 'Task updated successfully',
        task: updatedTask
      };

    } catch (error) {
      if (error.message.includes('Validation failed')) {
        return reply.status(400).send({
          success: false,
          message: error.message
        });
      }
      
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // DELETE /api/tasks/:id - Delete a task
  fastify.delete('/:id', {
    preHandler: verifyToken,
    schema: {
      description: 'Delete a task by ID',
      tags: ['tasks'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Task ID' }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'Task deleted successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            task: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                completed: { type: 'boolean' },
                userId: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        404: {
          description: 'Task not found',
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
      const taskId = parseInt(request.params.id);

      // Check if task exists and belongs to the user
      const existingTask = taskModel.getTaskById(taskId);
      if (!existingTask) {
        return reply.status(404).send({
          success: false,
          message: 'Task not found'
        });
      }

      if (existingTask.userId !== request.user.userId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied: You can only delete your own tasks'
        });
      }

      const deletedTask = taskModel.deleteTaskById(taskId);

      return {
        success: true,
        message: 'Task deleted successfully',
        task: deletedTask
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