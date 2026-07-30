import { Response, NextFunction } from 'express';
import prisma from '../prismaClient';
import { AuthRequest } from '../middleware/authenticate';
import { getRestaurantForUser, canManageRestaurant } from '../lib/ownership';

/** Public — browse every restaurant on the platform. */
export const getAllRestaurants = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json(restaurants);
  } catch (err) {
    next(err);
  }
};

/** The restaurant belonging to the logged-in owner. */
export const getMyRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurant = await getRestaurantForUser(req.user!.userId);

    if (!restaurant) {
      return res
        .status(404)
        .json({ message: 'You have not created a restaurant yet' });
    }

    res.status(200).json(restaurant);
  } catch (err) {
    next(err);
  }
};

/** Public — one restaurant by id. */
export const getRestaurantById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const restaurant = await prisma.restaurant.findUnique({ where: { id } });

    if (!restaurant) {
      return res
        .status(404)
        .json({ message: `Restaurant with ID ${id} not found` });
    }

    res.status(200).json(restaurant);
  } catch (err) {
    next(err);
  }
};

/** Create a restaurant, linked to the owner creating it. */
export const createRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, cuisineType, isOpen, address } = req.body;

    if (req.user!.role === 'RESTAURANT_OWNER') {
      const existing = await getRestaurantForUser(req.user!.userId);
      if (existing) {
        return res.status(409).json({ message: 'You already own a restaurant' });
      }
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        description,
        cuisineType,
        isOpen,
        address,
        ownerId:
          req.user!.role === 'RESTAURANT_OWNER' ? req.user!.userId : undefined,
      },
    });

    res.status(201).json(restaurant);
  } catch (err) {
    next(err);
  }
};

/** Update a restaurant — owners may only edit their own. */
export const updateRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { name, description, cuisineType, isOpen, address } = req.body;

    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ message: `Restaurant with ID ${id} not found` });
    }

    const allowed = await canManageRestaurant(
      req.user!.userId,
      req.user!.role,
      id
    );
    if (!allowed) {
      return res
        .status(403)
        .json({ message: 'You can only edit your own restaurant' });
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { name, description, cuisineType, isOpen, address },
    });

    res.status(200).json(restaurant);
  } catch (err) {
    next(err);
  }
};

/** Delete a restaurant — owners only their own, and only when it has no menu items. */
export const deleteRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ message: `Restaurant with ID ${id} not found` });
    }

    const allowed = await canManageRestaurant(
      req.user!.userId,
      req.user!.role,
      id
    );
    if (!allowed) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own restaurant' });
    }

    const menuItemCount = await prisma.menuItem.count({
      where: { restaurantId: id },
    });
    if (menuItemCount > 0) {
      return res.status(409).json({
        message: `Cannot delete restaurant ${id}: it still has ${menuItemCount} menu item(s). Delete or reassign them first.`,
      });
    }

    await prisma.restaurant.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};