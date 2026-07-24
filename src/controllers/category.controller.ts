import { NextFunction, Request, Response } from 'express';
import prisma from '../prismaClient';

// Getting all categories and calling the Prisma client to fetch all category records from the database.
export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
  const categories = await prisma.category.findMany();
  res.status(200).json(categories);

} catch (error) {
      next(error); // Pass the error to the next middleware for centralized error handling
}
};

// Getting a category by ID and calling the Prisma client to fetch a specific category record from the database
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: `Category with ID ${id} not found` });
    }
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};


// Creating a new category and calling the Prisma client to insert a new record into the database.
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// Updating a category by ID and calling the Prisma client to update a specific category record in the database.
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;
    const category = await prisma.category.update({ where: { id }, data: { name } });
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};


// Deleting a category by ID and calling the Prisma client to delete a specific category record from the database
// Before deletion, it checks if any menu items are associated with the category to prevent orphaned records.
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const menuItemCount = await prisma.menuItem.count({ where: { categoryId: id } });
    if (menuItemCount > 0) {
      return res.status(409).json({
        message: `Cannot delete category ${id}: ${menuItemCount} menu item(s) still use it.`,
      });
    }
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

