import { Response, NextFunction } from 'express';
import prisma from '../prismaClient';
import { AuthRequest } from '../middleware/authenticate';
import { getCustomerForUser, getRestaurantForUser } from '../lib/ownership';

/** Admin only — every order on the platform. */
export const getAllOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        restaurant: true,
        rider: true,
        orderitems: { include: { menuItem: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

/** The logged-in customer's own order history. */
export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await getCustomerForUser(req.user!.userId);
    if (!customer) {
      return res
        .status(404)
        .json({ message: 'No customer profile found for this account' });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: {
        restaurant: true,
        rider: true,
        orderitems: { include: { menuItem: true } },
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

/** Incoming orders for the logged-in owner's restaurant. */
export const getRestaurantOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurant = await getRestaurantForUser(req.user!.userId);
    if (!restaurant) {
      return res
        .status(404)
        .json({ message: 'No restaurant found for this account' });
    }

    const orders = await prisma.order.findMany({
      where: { restaurantId: restaurant.id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        rider: true,
        orderitems: { include: { menuItem: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

/** One order — customers see only theirs, owners only their restaurant's. */
export const getOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        restaurant: true,
        rider: true,
        orderitems: { include: { menuItem: true } },
        reviews: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: `Order with ID ${id} not found` });
    }

    const role = req.user!.role;

    if (role === 'CUSTOMER') {
      const customer = await getCustomerForUser(req.user!.userId);
      if (!customer || order.customerId !== customer.id) {
        return res
          .status(403)
          .json({ message: 'You can only view your own orders' });
      }
    }

    if (role === 'RESTAURANT_OWNER') {
      const restaurant = await getRestaurantForUser(req.user!.userId);
      if (!restaurant || order.restaurantId !== restaurant.id) {
        return res
          .status(403)
          .json({ message: 'You can only view orders for your own restaurant' });
      }
    }

    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

/** Place an order — the order and its items are created atomically. */
export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await getCustomerForUser(req.user!.userId);
    if (!customer) {
      return res
        .status(404)
        .json({ message: 'No customer profile found for this account' });
    }

    const { restaurantId, deliveryStreet, deliveryCity, items } = req.body;



    const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
    data: {
      customerId: customer.id,
      restaurantId,
      deliveryStreet,
      deliveryCity,
      status: 'PLACED',
    },
  });

      const orderItems = await Promise.all(
        items.map(
          (item: { menuItemId: number; quantity: number; priceAtOrder: number }) =>
            tx.orderItem.create({
              data: {
                orderId: order.id,
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                priceAtOrder: item.priceAtOrder,
              },
            })
        )
      );

      return { order, orderItems };
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/** Update status and/or assign a rider — owners limited to their own restaurant. */
export const updateOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { status, riderId } = req.body;

    const existing = await prisma.order.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: `Order with ID ${id} not found` });
    }

    if (req.user!.role === 'RESTAURANT_OWNER') {
      const restaurant = await getRestaurantForUser(req.user!.userId);
      if (!restaurant || existing.restaurantId !== restaurant.id) {
        return res.status(403).json({
          message: 'You can only update orders for your own restaurant',
        });
      }
    }

    // A rider may only be on one active delivery at a time.
    if (riderId && riderId !== existing.riderId) {
      const busy = await prisma.order.findFirst({
        where: {
          riderId,
          status: { in: ['PREPARING', 'OUT_FOR_DELIVERY'] },
          id: { not: id },
        },
      });

      if (busy) {
        return res.status(409).json({
          message: `That rider is already delivering order #${busy.id}`,
        });
      }
    }
    
    const order = await prisma.order.update({
      where: { id },
      data: { status, riderId },
    });

    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

/**
 * Orders are historical records and are never hard-deleted.
 * Cancelling is a status change via PUT, which keeps order history intact.
 */
export const deleteOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ message: `Order with ID ${id} not found` });
    }

    return res.status(403).json({
      message: 'Orders cannot be deleted. Update its status to CANCELLED instead.',
    });
  } catch (err) {
    next(err);
  }
};