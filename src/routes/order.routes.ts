import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { createOrderSchema } from '../validators/order.validator';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from '../controllers/order.controller';

const router = Router();

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Get all orders (admins only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders, each including customer, restaurant, rider, and order items
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', authenticate, authorize('ADMIN'), getAllOrders);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID (authenticated users only)
 *     tags: [Orders]
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
 *         description: The order
 *       401:
 *         description: No token provided
 *       404:
 *         description: Order not found
 */
router.get('/:id', authenticate, getOrderById);

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Place a new order (customers only) — creates the order and its items atomically
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, restaurantId, items]
 *             properties:
 *               customerId:
 *                 type: integer
 *               restaurantId:
 *                 type: integer
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [menuItemId, quantity, priceAtOrder]
 *                   properties:
 *                     menuItemId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     priceAtOrder:
 *                       type: number
 *     responses:
 *       201:
 *         description: Order placed, including its created order items
 *       400:
 *         description: Validation failed
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, authorize('CUSTOMER'), validate(createOrderSchema), createOrder);

/**
 * @openapi
 * /orders/{id}:
 *   put:
 *     summary: Update an order's status and/or assign a rider (owners, riders, admins)
 *     tags: [Orders]
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
 *               status:
 *                 type: string
 *                 enum: [PLACED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED]
 *               riderId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Order updated
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Order not found
 */
router.put('/:id', authenticate, authorize('RESTAURANT_OWNER', 'RIDER', 'ADMIN'), updateOrder);

/**
 * @openapi
 * /orders/{id}:
 *   delete:
 *     summary: Orders cannot be deleted — use PUT to set status to CANCELLED instead
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       401:
 *         description: No token provided
 *       403:
 *         description: Deletion is not permitted for orders
 *       404:
 *         description: Order not found
 */
router.delete('/:id', authenticate, deleteOrder);

export default router;