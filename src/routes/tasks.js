const { verifyToken } = require('../middleware/auth');
const taskModel = require('../models/tasks');
const {
  validateTaskCreate,
  validateTaskUpdate,
  validateTaskOwnership,
  isValidationError
} = require('../plugins/validators');

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
      const tasks = await taskModel.getTasksByUserId(request.user.userId);
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
                _id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                completed: { type: 'boolean' },
                userId: { type: 'string' },
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
      // Validate and sanitize task creation data
      const validatedData = validateTaskCreate(request.body, request.user.userId);
      
      const newTask = await taskModel.createTask(validatedData);

      return reply.status(201).send({
        success: true,
        message: 'Task created successfully',
        task: newTask
      });

    } catch (error) {
      if (isValidationError(error)) {
        return reply.status(400).send({
          success: false,
          message: error.message
        });
      }
      
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
          id: { type: 'string', description: 'Task ID' }
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
                _id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                completed: { type: 'boolean' },
                userId: { 
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    email: { type: 'string' }
                  }
                },
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
      const taskId = request.params.id;

      // Check if task exists and belongs to the user
      const existingTask = await taskModel.getTaskById(taskId);
      validateTaskOwnership(existingTask, request.user.userId);

      // Validate and sanitize update data
      const validatedUpdateData = validateTaskUpdate(request.body);

      const updatedTask = await taskModel.updateTaskById(taskId, validatedUpdateData);

      return {
        success: true,
        message: 'Task updated successfully',
        task: updatedTask
      };

    } catch (error) {
      if (isValidationError(error)) {
        return reply.status(400).send({
          success: false,
          message: error.message
        });
      }
      
      if (error.statusCode === 404) {
        return reply.status(404).send({
          success: false,
          message: error.message
        });
      }
      
      if (error.statusCode === 403) {
        return reply.status(403).send({
          success: false,
          message: error.message
        });
      }
      
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
          id: { type: 'string', description: 'Task ID' }
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
                _id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                completed: { type: 'boolean' },
                userId: { 
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    email: { type: 'string' }
                  }
                },
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
      const taskId = request.params.id;

      // Check if task exists and belongs to the user
      const existingTask = await taskModel.getTaskById(taskId);
      validateTaskOwnership(existingTask, request.user.userId);

      const deletedTask = await taskModel.deleteTaskById(taskId);

      return {
        success: true,
        message: 'Task deleted successfully',
        task: deletedTask
      };

    } catch (error) {
      if (error.statusCode === 404) {
        return reply.status(404).send({
          success: false,
          message: error.message
        });
      }
      
      if (error.statusCode === 403) {
        return reply.status(403).send({
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
}

module.exports = routes;