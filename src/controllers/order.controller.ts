import { NextFunction, Request, Response } from 'express';
import prisma from '../prismaClient';

// Get all orders from the database, including related customer, restaurant, rider, and order items information.
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        restaurant: true,
        rider: true,
      orderitems: { include: { menuItem: true } },
    },
  });
  res.status(200).json(orders);
  } catch (error) {
    next(error);
  }

};


// Get a specific order by ID from the database, including related customer, restaurant, rider, and order items information.
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      restaurant: true,
      rider: true,
      orderitems: { include: { menuItem: true } },
    },
  });

  if (!order) {
    return res.status(404).json({ message: `Order with ID ${id} not found` });
  }
  res.status(200).json(order);
  } catch (error) {
    next(error);
  }

};



// Create — an order plus its items, together, atomically
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, restaurantId, items } = req.body;
    // items = [{ menuItemId, quantity, priceAtOrder }, ...]

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: { customerId, restaurantId, status: 'PLACED' },
    });

    const orderItems = await Promise.all(
      items.map((item: { menuItemId: number; quantity: number; priceAtOrder: number }) =>
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
  } catch (error) {
    next(error);
  }

};

// Update — status and/or rider assignment
export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { status, riderId } = req.body;

  const order = await prisma.order.update({
    where: { id },
    data: { status, riderId },
  });

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    return res.status(404).json({ message: `Order with ID ${id} not found` });
  }

    return res.status(403).json({
      message: `Orders cannot be deleted. Update its status to CANCELLED instead.`,
    });
  } catch (error) {
    next(error);
  }
};