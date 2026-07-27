import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createRestaurantSchema } from '../validators/restaurant.validator';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';


import {
  getAllRestaurants,
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
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: A list of restaurants
 */
router.get('/', getAllRestaurants);

/**
 * @openapi
 * /restaurants/{id}:
 *   get:
 *     summary: Get a restaurant by ID
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
 *     summary: Create a new restaurant
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
 */

router.post('/', authenticate, authorize('RESTAURANT_OWNER','ADMIN'), validate(createRestaurantSchema), createRestaurant);

/**
 * @openapi
 * /restaurants/{id}:
 *   put:
 *     summary: Update a restaurant
 *     tags: [Restaurants]
 *    security:
 *    - bearerAuth: []
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
 *               isOpen:
 *                 type: boolean
 *     responses:
 * 
 *       200:
 *         description: Restaurant updated
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 *     
 *       404:
 *         description: Restaurant not found
 */
router.put('/:id', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), updateRestaurant);


/**
 * @openapi
 * /restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant
 *     tags: [Restaurants]
 *    security:
 *   - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *         204:
 *            description: Restaurant deleted
 *          401:
  *           description: No token provided
 *          403:
 *            description: Insufficient permissions
 *          404:
 *            description: Restaurant not found
 *          409:
 *            description: Restaurant has menu items and cannot be deleted
 */
router.delete('/:id', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), deleteRestaurant);




export default router;