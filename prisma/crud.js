require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter })
// Order place  and order item instance both are created together
// (so atomicity to ensure order and order item detail don't break in 
// middle.Because both need to made one can't be done without other.


async function placeOrder(customerId, restaurantId, items) {
  // items = array like: [{ menuItemId: 1, quantity: 2, priceAtOrder: 450 }, { menuItemId: 3, quantity: 1, priceAtOrder: 80 }]


  // prisma.$transaction(async (tx) => {...})
  // everything inside this callback is treated as one atomic unit.
  // If any line inside throws an error, Prisma automatically rolls back every change made so far in this block
  // the Order that got created gets undone too, like it never happened.
  
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        customerId,
        restaurantId,
        status: "PLACED",
      },
    });

    const orderItems = await Promise.all(
      items.map((item) =>
        tx.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceAtOrder: item.priceAtOrder,
          },
        })
      )
    );

    return { order, orderItems };
  });

  console.log("Order placed:", result);
  return result;
}



// READ — getting all orders placed by a customer, including their items and restaurant
async function getCustomerOrders(customerId) {
  const orders = await prisma.order.findMany({
    where: { customerId },
    include: {
      restaurant: true,
      orderitems: {
        include: { menuItem: true },
      },
      rider: true,
    },
  });
  console.log("Customer orders:", JSON.stringify(orders, null, 2));
  return orders;
}


// READ — get a restaurant's full menu, grouped naturally by category
async function getRestaurantMenu(restaurantId) {
  const menu = await prisma.menuItem.findMany({
    where: { restaurantId, isAvailable: true },
    include: { category: true },
  });
  console.log("Restaurant menu:", JSON.stringify(menu, null, 2));
  return menu;
}

// assigning rider to existing order

async function assignRider(orderId, riderId) {
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { riderId: riderId },
  });
  console.log("Rider assigned:", updatedOrder);
}


// Changing order status
async function updateOrderStatus(orderId, newStatus) {
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
  console.log("Order status updated:", updatedOrder);
}

// Adding review to order
async function addReview(customerId, orderId, targetType, rating, comment) {
  const review = await prisma.review.create({
    data: {
      // Short hand property
      customerId,
      orderId,
      targetType,
      rating,
      comment
    },
  });
  console.log("Review Added:", review);
  return review;
}


// DELETE — removing one of a customer's saved addresses
async function deleteAddress(addressId) {
  const deletedAddress = await prisma.address.delete({
    where: { id: addressId },
  });
  console.log("Address deleted:", deletedAddress);
  return deletedAddress;
}


async function main() {
  //placing a new order for customer 2 at restaurant 1, ordering menuItem 2
  // await placeOrder(2, 1, [{ menuItemId: 2, quantity: 1, priceAtOrder: 350 }]);

  // getting all orders for customer 1 (with restaurant, items, rider)
  //await getCustomerOrders(1);

  // getting restaurant 1's full available menu
  await getRestaurantMenu(1);
 
  // assigning rider 2 to order 2
  // await assignRider(2, 2);
 
  //updating order 2's status
  // await updateOrderStatus(2, "PREPARING");
 
  // adding a review for order 1, targeting the restaurant
  // await addReview(1, 1, "RESTAURANT", 5, "Great food, fast delivery!");

}
 
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });