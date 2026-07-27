import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { createCategorySchema } from '../validators/category.validator';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Get all categories (public)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of categories
 */
router.get('/', getAllCategories);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     summary: Get a category by ID (public)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The category
 *       404:
 *         description: Category not found
 */
router.get('/:id', getCategoryById);

/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Create a new category (restaurant owners and admins only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), validate(createCategorySchema), createCategory);

/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     summary: Update a category (restaurant owners and admins only)
 *     tags: [Categories]
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
 *     responses:
 *       200:
 *         description: Category updated
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 */
router.put('/:id', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), updateCategory);

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category (admins only)
 *     tags: [Categories]
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
 *         description: Category deleted
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category still has menu items and cannot be deleted
 */
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategory);

export default router;