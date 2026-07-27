import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { createCustomerSchema } from '../validators/customer.validator';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller';

const router = Router();

/**
 * @openapi
 * /customers:
 *   get:
 *     summary: Get all customers (admins only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of customers
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', authenticate, authorize('ADMIN'), getAllCustomers);

/**
 * @openapi
 * /customers/{id}:
 *   get:
 *     summary: Get a customer by ID (authenticated users only)
 *     tags: [Customers]
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
 *         description: The customer
 *       401:
 *         description: No token provided
 *       404:
 *         description: Customer not found
 */
router.get('/:id', authenticate, getCustomerById);

/**
 * @openapi
 * /customers:
 *   post:
 *     summary: Create a customer profile (public — part of sign-up)
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Customer created
 *       400:
 *         description: Validation failed
 *       409:
 *         description: A customer with this email already exists
 */
router.post('/', validate(createCustomerSchema), createCustomer);

/**
 * @openapi
 * /customers/{id}:
 *   put:
 *     summary: Update a customer (authenticated users only)
 *     tags: [Customers]
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
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Customer updated
 *       401:
 *         description: No token provided
 *       404:
 *         description: Customer not found
 */
router.put('/:id', authenticate, updateCustomer);

/**
 * @openapi
 * /customers/{id}:
 *   delete:
 *     summary: Delete a customer (admins only)
 *     tags: [Customers]
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
 *         description: Customer deleted
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Customer not found
 */
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCustomer);

export default router;