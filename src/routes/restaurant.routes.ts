import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { createRestaurantSchema } from '../validators/restaurant.validator';
import {
  getAllRestaurants,
  getMyRestaurant,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../controllers/restaurant.controller';

const router = Router();

/**
 * @openapi
 * /restaurants:
 *   get:
 *     summary: Get all restaurants (public)
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: A list of restaurants
 */
router.get('/', getAllRestaurants);

/**
 * @openapi
 * /restaurants/my-restaurant:
 *   get:
 *     summary: Get the restaurant belonging to the logged-in owner
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The owner's restaurant
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: This owner has not created a restaurant yet
 */
router.get('/my-restaurant',authenticate,authorize('RESTAURANT_OWNER', 'ADMIN'),getMyRestaurant);

/**
 * @openapi
 * /restaurants/{id}:
 *   get:
 *     summary: Get a restaurant by ID (public)
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The restaurant
 *       404:
 *         description: Restaurant not found
 */
router.get('/:id', getRestaurantById);

/**
 * @openapi
 * /restaurants:
 *   post:
 *     summary: Create a restaurant (restaurant owners and admins only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, cuisineType, address]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               cuisineType:
 *                 type: string
 *               isOpen:
 *                 type: boolean
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurant created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: This owner already has a restaurant
 */
router.post(
  '/',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(createRestaurantSchema),
  createRestaurant
);

/**
 * @openapi
 * /restaurants/{id}:
 *   put:
 *     summary: Update a restaurant (owners may only edit their own)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               cuisineType:
 *                 type: string
 *               isOpen:
 *                 type: boolean
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restaurant updated
 *       401:
 *         description: No token provided
 *       403:
 *         description: Not your restaurant
 *       404:
 *         description: Restaurant not found
 */
router.put(
  '/:id',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  updateRestaurant
);

/**
 * @openapi
 * /restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant (owners may only delete their own)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Restaurant deleted
 *       401:
 *         description: No token provided
 *       403:
 *         description: Not your restaurant
 *       404:
 *         description: Restaurant not found
 *       409:
 *         description: Restaurant still has menu items
 */
router.delete(
  '/:id',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  deleteRestaurant
);

export default router;