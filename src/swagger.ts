import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Food Delivery Platform API',
      version: '1.0.0',
      description: 'REST API for a multi-vendor food delivery platform — restaurants, menu items, customers, orders, riders, and reviews.',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./src/routes/*.ts'], // where swagger-jsdoc looks for the comments
};

export const swaggerSpec = swaggerJsdoc(options);