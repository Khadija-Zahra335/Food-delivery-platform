import { Router } from 'express';
import { validate } from '../middleware/validate';
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
 *     summary: Get all riders
 *     tags: [Riders]
 *     responses:
 *       200:
 *         description: A list of riders
 */
router.get('/', getAllRiders);

/**
 * @openapi
 * /riders/{id}:
 *   get:
 *     summary: Get a rider by ID
 *     tags: [Riders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The rider
 *       404:
 *         description: Rider not found
 */
router.get('/:id', getRiderById);

/**
 * @openapi
 * /riders:
 *   post:
 *     summary: Create a new rider
 *     tags: [Riders]
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
 */
router.post('/', validate(createRiderSchema), createRider);

/**
 * @openapi
 * /riders/{id}:
 *   put:
 *     summary: Update a rider
 *     tags: [Riders]
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
 *       404:
 *         description: Rider not found
 */
router.put('/:id', updateRider);

/**
 * @openapi
 * /riders/{id}:
 *   delete:
 *     summary: Delete a rider
 *     tags: [Riders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Rider deleted
 *       404:
 *         description: Rider not found
 *       409:
 *         description: Rider has delivery history and cannot be deleted
 */
router.delete('/:id', deleteRider);

export default router;