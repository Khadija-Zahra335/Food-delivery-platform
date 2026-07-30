import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { createAddressSchema, updateAddressSchema } from '../validators/address.validator';
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/address.controller';

const router = Router();

/**
 * @openapi
 * /addresses:
 *   get:
 *     summary: Get the logged-in customer's saved addresses
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the customer's addresses
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', authenticate, authorize('CUSTOMER'), getMyAddresses);

/**
 * @openapi
 * /addresses:
 *   post:
 *     summary: Add a saved address for the logged-in customer
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [street, city]
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: No token provided
 */
router.post('/', authenticate, authorize('CUSTOMER'), validate(createAddressSchema), createAddress);

/**
 * @openapi
 * /addresses/{id}:
 *   put:
 *     summary: Update one of the logged-in customer's addresses
 *     tags: [Addresses]
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
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated
 *       403:
 *         description: Not your address
 *       404:
 *         description: Address not found
 */
router.put('/:id', authenticate, authorize('CUSTOMER'), validate(updateAddressSchema), updateAddress);

/**
 * @openapi
 * /addresses/{id}:
 *   delete:
 *     summary: Delete one of the logged-in customer's addresses
 *     tags: [Addresses]
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
 *         description: Address deleted
 *       403:
 *         description: Not your address
 *       404:
 *         description: Address not found
 */
router.delete('/:id', authenticate, authorize('CUSTOMER'), deleteAddress);

export default router;