import { Response, NextFunction } from 'express';
import prisma from '../prismaClient';
import { AuthRequest } from '../middleware/authenticate';
import { canManageRestaurant } from '../lib/ownership';

/** Public — every menu item on the platform. */
export const getAllMenuItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: { restaurant: true, category: true },
    });
    res.status(200).json(menuItems);
  } catch (err) {
    next(err);
  }
};

/** Public — one restaurant's full menu, ordered so categories group naturally. */
export const getMenuByRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurantId = Number(req.params.restaurantId);

    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId },
      include: { category: true },
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
    });

    res.status(200).json(menuItems);
  } catch (err) {
    next(err);
  }
};

/** Public — one menu item by id. */
export const getMenuItemById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true, category: true },
    });

    if (!menuItem) {
      return res
        .status(404)
        .json({ message: `Menu item with ID ${id} not found` });
    }

    res.status(200).json(menuItem);
  } catch (err) {
    next(err);
  }
};

/** Create a menu item — owners may only add to their own restaurant. */
export const createMenuItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, price, isAvailable, restaurantId, categoryId } =
      req.body;

    const allowed = await canManageRestaurant(
      req.user!.userId,
      req.user!.role,
      restaurantId
    );

    if (!allowed) {
      return res.status(403).json({
        message: 'You can only add menu items to your own restaurant',
      });
    }

    const menuItem = await prisma.menuItem.create({
      data: { name, description, price, isAvailable, restaurantId, categoryId },
    });

    res.status(201).json(menuItem);
  } catch (err) {
    next(err);
  }
};

/** Update a menu item — ownership checked against the item's restaurant. */
export const updateMenuItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { name, description, price, isAvailable, categoryId } = req.body;

    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ message: `Menu item with ID ${id} not found` });
    }

    const allowed = await canManageRestaurant(
      req.user!.userId,
      req.user!.role,
      existing.restaurantId
    );

    if (!allowed) {
      return res.status(403).json({
        message: 'You can only edit menu items belonging to your own restaurant',
      });
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: { name, description, price, isAvailable, categoryId },
    });

    res.status(200).json(menuItem);
  } catch (err) {
    next(err);
  }
};

/** Delete a menu item — ownership checked against the item's restaurant. */
export const deleteMenuItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ message: `Menu item with ID ${id} not found` });
    }

    const allowed = await canManageRestaurant(
      req.user!.userId,
      req.user!.role,
      existing.restaurantId
    );

    if (!allowed) {
      return res.status(403).json({
        message:
          'You can only delete menu items belonging to your own restaurant',
      });
    }

    await prisma.menuItem.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};