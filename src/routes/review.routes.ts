import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { createReviewSchema } from '../validators/review.validator';
import {
  getRestaurantReviews,
  getMyReviews,
  createReview,
  deleteReview,
} from '../controllers/review.controller';

const router = Router();

/**
 * @openapi
 * /reviews/restaurant/{restaurantId}:
 *   get:
 *     summary: Get all reviews for a restaurant (public)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of reviews for the restaurant
 */
router.get('/restaurant/:restaurantId', getRestaurantReviews);

/**
 * @openapi
 * /reviews/my-reviews:
 *   get:
 *     summary: Get the logged-in customer's own reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the customer's reviews
 *       401:
 *         description: No token provided
 *       403:
 *         description: Insufficient permissions
 */
router.get('/my-reviews', authenticate, authorize('CUSTOMER'), getMyReviews);

/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Leave a review for a delivered order
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, targetType, rating]
 *             properties:
 *               orderId:
 *                 type: integer
 *               targetType:
 *                 type: string
 *                 enum: [RESTAURANT, RIDER]
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: No token provided
 *       403:
 *         description: Not your order
 *       404:
 *         description: Order not found
 *       409:
 *         description: Order not delivered, no rider assigned, or already reviewed
 */
router.post('/', authenticate, authorize('CUSTOMER'), validate(createReviewSchema), createReview);

/**
 * @openapi
 * /reviews/{id}:
 *   delete:
 *     summary: Delete one of your own reviews
 *     tags: [Reviews]
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
 *         description: Review deleted
 *       401:
 *         description: No token provided
 *       403:
 *         description: Not your review
 *       404:
 *         description: Review not found
 */
router.delete('/:id', authenticate, deleteReview);

export default router;