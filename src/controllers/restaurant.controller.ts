import { NextFunction, Request, Response  } from 'express';
import prisma from '../prismaClient';
import { createRestaurantSchema } from '../validators/restaurant.validator';

export const getAllRestaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurants = await prisma.restaurant.findMany();
    res.status(200).json(restaurants);
  } catch (error) {
    next(error);
  }
};


export const getRestaurantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const restaurant = await prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      return res.status(404).json({ message: `Restaurant with ID ${id} not found` });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    next(error);
  }
};




export const createRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, cuisineType, isOpen, address } = req.body;

  const restaurant = await prisma.restaurant.create({
    data: { name, description, cuisineType, isOpen, address },
  });

    res.status(201).json(restaurant);
  } catch (error) {
    next(error);
  }
};


export const updateRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name, description, cuisineType, isOpen, address } = req.body;
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { name, description, cuisineType, isOpen, address },
      });

  res.status(200).json(restaurant);
  } catch (error) {
    next(error);
  } 
};

// Deleting a restaurant by ID and calling the Prisma client to delete a specific restaurant record from the database. 
export const deleteRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await prisma.restaurant.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  } 
};
