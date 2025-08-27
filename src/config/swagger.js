module.exports = {
  openapi: {
    info: {
      title: 'Task Management API',
      description: 'A simple task management API with JWT authentication',
      version: '1.0.0'
    },
    servers: [
      { url: 'http://localhost:3000' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
};
  