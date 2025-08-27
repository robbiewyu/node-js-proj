const fastify = require('fastify')({ logger: true });
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');

// Load swagger config
const swaggerConfig = require('./config/swagger');

// Register Swagger plugins
fastify.register(swagger, swaggerConfig);
fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
});

// Register routes
fastify.register(require('./routes/auth'), { prefix: '/api/auth' });
fastify.register(require('./routes/tasks'), { prefix: '/api/tasks' });

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server running at http://localhost:3000');
    console.log('Swagger docs available at http://localhost:3000/docs');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();