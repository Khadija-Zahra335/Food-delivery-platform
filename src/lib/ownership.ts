import prisma from '../prismaClient';

/** The Customer profile belonging to a logged-in user, or null. */
export async function getCustomerForUser(userId: number) {
  return prisma.customer.findUnique({ where: { userId } });
}

/** The Restaurant owned by a logged-in user, or null. */
export async function getRestaurantForUser(userId: number) {
  return prisma.restaurant.findUnique({ where: { ownerId: userId } });
}

/**
 * True when the user may act on the given restaurant:
 * admins may act on any, owners only on their own.
 */
export async function canManageRestaurant(
  userId: number,
  role: string,
  restaurantId: number
) {
  if (role === 'ADMIN') return true;
  const restaurant = await getRestaurantForUser(userId);
  return restaurant?.id === restaurantId;
}