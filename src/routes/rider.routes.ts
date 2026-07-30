import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { createRiderSchema } from '../validators/rider.validator';
import {
  getAllRiders,
  getRiderById,
  createRider,
  updateRider,
  deleteRider,
} from '../controllers/rider.controller';

const router = Router();

/**
 * @openapi
 * /riders:
 *   get:
 *     summary: Get all riders (admins and restaurant owners only)
 *     tags: [Riders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of riders
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', authenticate, authorize('ADMIN', 'RESTAURANT_OWNER'), getAllRiders);


router.get(
  '/available',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  getAllRiders
);

/**
 * @openapi
 * /riders/{id}:
 *   get:
 *     summary: Get a rider by ID (authenticated users only)
 *     tags: [Riders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The rider
 *       401:
 *         description: No token provided
 *       404:
 *         description: Rider not found
 */
router.get('/:id', authenticate, getRiderById);

/**
 * @openapi
 * /riders:
 *   post:
 *     summary: Create a new rider (admins only)
 *     tags: [Riders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phoneNo]
 *             properties:
 *               name:
 *                 type: string
 *               phoneNo:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Rider created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, authorize('ADMIN'), validate(createRiderSchema), createRider);

/**
 * @openapi
 * /riders/{id}:
 *   put:
 *     summary: Update a rider (riders and admins only)
 *     tags: [Riders]
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
 *               phoneNo:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Rider updated
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Rider not found
 */
router.put('/:id', authenticate, authorize('RIDER', 'ADMIN'), updateRider);

/**
 * @openapi
 * /riders/{id}:
 *   delete:
 *     summary: Delete a rider (admins only)
 *     tags: [Riders]
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
 *         description: Rider deleted
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Rider not found
 *       409:
 *         description: Rider has delivery history and cannot be deleted
 */
router.delete('/:id', authenticate, authorize('ADMIN'), deleteRider);

export default router;