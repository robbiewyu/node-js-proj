const jwt = require('jsonwebtoken');

const userModel = require('../models/users');
const {
  validateUserRegistration,
  validateUserLogin,
  checkUserExists,
  validateUserCredentials,
  hashPassword,
  isValidationError
} = require('../plugins/validators');

// JWT secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function routes(fastify, options) {
  // POST /api/auth/register - User registration
  fastify.post('/register', {
    schema: {
      description: 'Register a new user',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        201: {
          description: 'User registered successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                email: { type: 'string' },
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
      // Validate and sanitize user registration data
      const validatedData = validateUserRegistration(request.body);
      
      // Check if user already exists
      await checkUserExists(userModel, validatedData.email);

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create new user
      const newUser = await userModel.addUser({
        email: validatedData.email,
        password: hashedPassword
      });

      // Return user without password
      const { password: _, ...userResponse } = newUser.toObject();

      return reply.status(201).send({
        success: true,
        message: 'User registered successfully',
        user: userResponse
      });

    } catch (error) {
      if (isValidationError(error)) {
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

  // POST /api/auth/login - User login
  fastify.post('/login', {
    schema: {
      description: 'Login user and return JWT token',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Login successful',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                email: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' }
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
      // Validate and sanitize login data
      const validatedData = validateUserLogin(request.body);

      // Validate user credentials
      const user = await validateUserCredentials(userModel, validatedData.email, validatedData.password);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return user without password
      const { password: _, ...userResponse } = user.toObject();

      return reply.send({
        success: true,
        message: 'Login successful',
        token,
        user: userResponse
      });

    } catch (error) {
      if (isValidationError(error)) {
        return reply.status(400).send({
          success: false,
          message: error.message
        });
      }
      
      if (error.statusCode === 401) {
        return reply.status(401).send({
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
