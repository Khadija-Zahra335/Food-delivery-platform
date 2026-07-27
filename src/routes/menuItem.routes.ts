import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { createMenuItemSchema } from '../validators/menuItem.validator';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuItem.controller';

const router = Router();

/**
 * @openapi
 * /menu-items:
 *   get:
 *     summary: Get all menu items (public)
 *     tags: [MenuItems]
 *     responses:
 *       200:
 *         description: A list of menu items, each including its restaurant and category
 */
router.get('/', getAllMenuItems);

/**
 * @openapi
 * /menu-items/{id}:
 *   get:
 *     summary: Get a menu item by ID (public)
 *     tags: [MenuItems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The menu item
 *       404:
 *         description: Menu item not found
 */
router.get('/:id', getMenuItemById);

/**
 * @openapi
 * /menu-items:
 *   post:
 *     summary: Create a new menu item (restaurant owners and admins only)
 *     tags: [MenuItems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, restaurantId, categoryId]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               isAvailable:
 *                 type: boolean
 *               restaurantId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Menu item created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), validate(createMenuItemSchema), createMenuItem);

/**
 * @openapi
 * /menu-items/{id}:
 *   put:
 *     summary: Update a menu item (restaurant owners and admins only)
 *     tags: [MenuItems]
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
 *               price:
 *                 type: number
 *               isAvailable:
 *                 type: boolean
 *               restaurantId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Menu item updated
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Menu item not found
 */
router.put('/:id', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), updateMenuItem);

/**
 * @openapi
 * /menu-items/{id}:
 *   delete:
 *     summary: Delete a menu item (restaurant owners and admins only)
 *     tags: [MenuItems]
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
 *         description: Menu item deleted
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Menu item not found
 */
router.delete('/:id', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), deleteMenuItem);

export default router;