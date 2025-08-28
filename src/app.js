const fastify = require('fastify')({ logger: true });
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');

// Load configuration
const swaggerConfig = require('./config/swagger');
const { connectDB } = require('./config/database');

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
fastify.register(require('./routes/debug'), { prefix: '/api/debug' });

// Start server
const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Fastify server
    await fastify.listen({ port: 3000 });
    console.log('Server running at http://localhost:3000');
    console.log('Swagger docs available at http://localhost:3000/docs');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();