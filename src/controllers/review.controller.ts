import { Response, NextFunction } from 'express';
import prisma from '../prismaClient';
import { AuthRequest } from '../middleware/authenticate';
import { getCustomerForUser } from '../lib/ownership';

/** Public — all reviews for one restaurant, used on the restaurant page. */
export const getRestaurantReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurantId = Number(req.params.restaurantId);

    const reviews = await prisma.review.findMany({
      where: {
        targetType: 'RESTAURANT',
        order: { restaurantId },
      },
      include: { customer: { select: { id: true, name: true } } },
      orderBy: { id: 'desc' },
    });

    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};

/** The logged-in customer's own reviews. */
export const getMyReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await getCustomerForUser(req.user!.userId);
    if (!customer) {
      return res.status(404).json({ message: 'No customer profile found for this account' });
    }

    const reviews = await prisma.review.findMany({
      where: { customerId: customer.id },
      include: { order: { include: { restaurant: true } } },
      orderBy: { id: 'desc' },
    });

    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};

/** Create a review for a completed order the customer actually placed. */
export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await getCustomerForUser(req.user!.userId);
    if (!customer) {
      return res.status(404).json({ message: 'No customer profile found for this account' });
    }

    const { orderId, targetType, rating, comment } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ message: `Order with ID ${orderId} not found` });
    }

    // You may only review your own order.
    if (order.customerId !== customer.id) {
      return res.status(403).json({ message: 'You can only review your own orders' });
    }

    // The brief says reviews are left after an order is completed.
    if (order.status !== 'DELIVERED') {
      return res.status(409).json({
        message: 'You can only review an order once it has been delivered',
      });
    }

    // A rider review needs a rider to have been assigned.
    if (targetType === 'RIDER' && !order.riderId) {
      return res.status(409).json({
        message: 'This order has no rider assigned, so it cannot be reviewed',
      });
    }

    // One review per target per order.
    const existing = await prisma.review.findFirst({
      where: { orderId, customerId: customer.id, targetType },
    });

    if (existing) {
      return res.status(409).json({
        message: `You have already reviewed the ${targetType.toLowerCase()} for this order`,
      });
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        customerId: customer.id,
        targetType,
        rating,
        comment,
      },
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

/** Delete one of your own reviews. */
export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const customer = await getCustomerForUser(req.user!.userId);

    const existing = await prisma.review.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: `Review with ID ${id} not found` });
    }

    const isOwner = customer && existing.customerId === customer.id;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await prisma.review.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};