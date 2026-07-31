// This file is the entry point of the application.
// It sets up the Express server and registers the routes for different resources
//  like restaurants, menu items, categories, customers, and riders.
import express from "express";
import restaurantRoutes from './routes/restaurant.routes';
import menuItemRoutes from './routes/menuItem.routes';

import categoryRoutes from './routes/category.routes';
import customerRoutes from './routes/customer.routes';
import riderRoutes from './routes/rider.routes';
import orderRoutes from './routes/order.routes';
import { errorHandler } from './middleware/errorHandler';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

import authRoutes from './routes/auth.routes';
import addressRoutes from './routes/address.routes';
import cors from 'cors';
import reviewRoutes from './routes/review.routes';

// Create an Express application
const app = express();


// Allows Express to parse incoming JSON requests from the client
app.use(express.json());


// Enable CORS for all routes
const allowedOrigins = [
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({ origin: allowedOrigins }));

// Register the restaurant routes with the Express application
// "Whenever a request starts with /restaurants, send it to restaurantRoutes.ts."
app.use('/restaurants', restaurantRoutes);
app.use('/menu-items', menuItemRoutes);

app.use('/categories', categoryRoutes);
app.use('/customers', customerRoutes);
app.use('/riders', riderRoutes);
app.use('/orders', orderRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);

app.use('/addresses', addressRoutes);
app.use('/reviews', reviewRoutes);


app.use(errorHandler);


export default app;