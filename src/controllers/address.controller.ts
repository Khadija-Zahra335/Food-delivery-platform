import { Response, NextFunction } from 'express';
import prisma from '../prismaClient';
import { AuthRequest } from '../middleware/authenticate';

/** Finds the Customer record belonging to the logged-in user. */
async function getCustomerForUser(userId: number) {
  return prisma.customer.findUnique({ where: { userId } });
}

export const getMyAddresses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await getCustomerForUser(req.user!.userId);
    if (!customer) {
      return res.status(404).json({ message: 'No customer profile found for this account' });
    }

    const addresses = await prisma.address.findMany({
      where: { customerId: customer.id },
    });

    res.status(200).json(addresses);
  } catch (err) {
    next(err);
  }
};

export const createAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await getCustomerForUser(req.user!.userId);
    if (!customer) {
      return res.status(404).json({ message: 'No customer profile found for this account' });
    }

    const { street, city } = req.body;

    const address = await prisma.address.create({
      data: { street, city, customerId: customer.id },
    });

    res.status(201).json(address);
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const customer = await getCustomerForUser(req.user!.userId);

    const existing = await prisma.address.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: `Address with ID ${id} not found` });
    }

    // ownership check — you may only touch your own addresses
    if (!customer || existing.customerId !== customer.id) {
      return res.status(403).json({ message: 'You can only modify your own addresses' });
    }

    const { street, city } = req.body;
    const address = await prisma.address.update({
      where: { id },
      data: { street, city },
    });

    res.status(200).json(address);
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const customer = await getCustomerForUser(req.user!.userId);

    const existing = await prisma.address.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: `Address with ID ${id} not found` });
    }

    if (!customer || existing.customerId !== customer.id) {
      return res.status(403).json({ message: 'You can only delete your own addresses' });
    }

    await prisma.address.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};