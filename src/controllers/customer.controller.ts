import { Request, Response , NextFunction } from 'express';
import prisma from '../prismaClient';

// Getting all customers and calling the Prisma client to fetch all customer records from the database.
export const getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await prisma.customer.findMany();
    res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
};

// Getting a customer by ID and calling the Prisma client to fetch a specific customer record from the database

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      return res.status(404).json({ message: `Customer with ID ${id} not found` });
    }
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

// Creating a new customer and calling the Prisma client to insert a new record into the database.

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: `A customer with email ${email} already exists` });
  }

    const customer = await prisma.customer.create({ data: { name, email } });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

// Updating a customer by ID and calling the Prisma client to update a specific customer record in the database
export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name, email } = req.body;
    const customer = await prisma.customer.update({ where: { id }, data: { name, email } });
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

// Deleting a customer by ID and calling the Prisma client to delete a specific customer record from the database
export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await prisma.customer.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

