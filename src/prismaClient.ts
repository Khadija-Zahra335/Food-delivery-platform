// In a real Express app, you don't want every controller file creating a fresh connection 
// — that wastes resources and can cause connection issues under load.
// Instead, we create one shared instance, in its own file, and every controller imports it.

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;