const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('../models/users');

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
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 30 },
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
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' }
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
      const { username, email, password } = request.body;

      // Check if user already exists
      const existingUser = userModel.getUserByEmail(email) || userModel.getUserByUsername(username);

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          message: 'User with this email or username already exists'
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = {
        id: userModel.getUsers().length + 1,
        username,
        email,
        password: hashedPassword,
        createdAt: new Date()
      };

      userModel.addUser(newUser);

      // Return user without password
      const { password: _, ...userResponse } = newUser;

      return reply.status(201).send({
        success: true,
        message: 'User registered successfully',
        user: userResponse
      });

    } catch (error) {
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
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' }
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
      const { email, password } = request.body;

      // Find user by email
      const user = userModel.getUserByEmail(email);

      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return reply.status(401).send({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          username: user.username
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return user without password
      const { password: _, ...userResponse } = user;

      return reply.send({
        success: true,
        message: 'Login successful',
        token,
        user: userResponse
      });

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
