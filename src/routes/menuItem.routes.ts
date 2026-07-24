import { Router } from 'express';
import { validate } from '../middleware/validate';
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
 *     summary: Get all menu items
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
 *     summary: Get a menu item by ID
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
 *     summary: Create a new menu item
 *     tags: [MenuItems]
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
 */
router.post('/', validate(createMenuItemSchema), createMenuItem);

/**
 * @openapi
 * /menu-items/{id}:
 *   put:
 *     summary: Update a menu item
 *     tags: [MenuItems]
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
 *       404:
 *         description: Menu item not found
 */
router.put('/:id', updateMenuItem);

/**
 * @openapi
 * /menu-items/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [MenuItems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Menu item deleted
 *       404:
 *         description: Menu item not found
 */
router.delete('/:id', deleteMenuItem);

export default router;