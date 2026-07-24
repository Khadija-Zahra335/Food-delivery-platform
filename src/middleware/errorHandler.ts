import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  // Prisma-specific: known request errors have a `code`
  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'A record with this value already exists' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found' });
  }
  if (err.code === 'P2003' || err.code === 'P2004') {
    return res.status(409).json({ message: 'This action conflicts with related data' });
  }

  // Fallback — anything unexpected
  res.status(500).json({ message: 'Something went wrong on the server' });
};