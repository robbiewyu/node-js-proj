const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to verify JWT token
 * Adds the decoded user information to request.user
 */
const verifyToken = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user information to request object
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Optional middleware to verify token but not fail if missing
 * Useful for routes that work for both authenticated and unauthenticated users
 */
const optionalAuth = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      request.user = decoded;
    }
    // If no token or invalid token, just continue without setting request.user
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }
};

/**
 * Middleware to check if user owns the resource
 * Should be used after verifyToken
 */
const checkResourceOwnership = (getUserIdFromResource) => {
  return async (request, reply) => {
    try {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const resourceUserId = getUserIdFromResource(request);
      
      if (resourceUserId !== request.user.userId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied: You can only access your own resources'
        });
      }
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: 'Error checking resource ownership'
      });
    }
  };
};

module.exports = {
  verifyToken,
  optionalAuth,
  checkResourceOwnership,
  JWT_SECRET
};
