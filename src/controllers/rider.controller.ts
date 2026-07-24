import { NextFunction, Request, Response } from 'express';
import prisma from '../prismaClient';


// Get all riders from the database  
export const getAllRiders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const riders = await prisma.rider.findMany();
    res.status(200).json(riders);
  } catch (error) {
    next(error);
  }   
};

// Get a specific rider by ID from the database

export const getRiderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const rider = await prisma.rider.findUnique({ where: { id } });

    if (!rider) {
      return res.status(404).json({ message: `Rider with ID ${id} not found` });
    }
    res.status(200).json(rider);
  } catch (error) {
    next(error);
  } 
};

// Create a new rider in the database

export const createRider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phoneNo, isAvailable } = req.body;
    const rider = await prisma.rider.create({ data: { name, phoneNo, isAvailable } });
    res.status(201).json(rider);
  } catch (error) {
    next(error);
  }   
};

// Update an existing rider in the database

export const updateRider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name, phoneNo, isAvailable } = req.body;
    const rider = await prisma.rider.update({ where: { id }, data: { name, phoneNo, isAvailable } });
    res.status(200).json(rider);
  } catch (error) {
    next(error);
  }
};

// Delete a rider from the database
export const deleteRider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await prisma.rider.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

