import { NextFunction, Request, Response } from 'express';
import prisma from '../prismaClient';


// Getting all menu items and calling the Prisma client to fetch all menu item records from the database.
export const getAllMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: { restaurant: true, category: true },
    });
    res.status(200).json(menuItems);
  } catch (error) {
    next(error);
  }
};

// Getting a menu item by ID and calling the Prisma client to fetch a specific menu item record from the database 
export const getMenuItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true, category: true },
    });

  if (!menuItem) {
    return res.status(404).json({ message: `MenuItem with ID ${id} not found` });
  }

  res.status(200).json(menuItem);
  } catch (error) {
    next(error);
  }
};

// Creating a new menu item and calling the Prisma client to insert a new record into the database.
export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, isAvailable, restaurantId, categoryId } = req.body;

  const menuItem = await prisma.menuItem.create({
    data: { name, description, price, isAvailable, restaurantId, categoryId },
  });

    res.status(201).json(menuItem);
  } catch (error) {
    next(error);
  }
};

// Updating a menu item by ID and calling the Prisma client to update a specific menu item record in the database
export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name, description, price, isAvailable, restaurantId, categoryId } = req.body;

  const menuItem = await prisma.menuItem.update({
    where: { id },
    data: { name, description, price, isAvailable, restaurantId, categoryId },
  });

    res.status(200).json(menuItem);
  } catch (error) {
    next(error);
  }
};

// Deleting a menu item by ID and calling the Prisma client to delete a specific menu item record from the database 
export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await prisma.menuItem.delete({ where: { id } });
    res.status(200).json({ message: `MenuItem with ID ${id} Deleted succesfully` });
  } catch (error) {
    next(error);
  }
};
