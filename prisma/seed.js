require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

 
// Since database calls take time (they're not instant like normal JS),
// Prisma functions are asynchronous — they return Promises.
// That means our seeding logic needs to live inside an async function,
// and every database call needs an await in front of it.

async function main() {

  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.rider.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.category.deleteMany();
  await prisma.restaurant.deleteMany();

  // Restaurant Data
  const restaurant1 = await prisma.restaurant.create({
    data: {
      name: "Karachi Biryani House",
      description: "Authentic Sindhi biryani and BBQ",
      cuisineType: "Pakistani",
      isOpen: true,
      address: "Main Boulevard, Karachi",
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      name: "Pizza Point",
      description: "Wood-fired pizzas and Italian classics",
      cuisineType: "Italian",
      isOpen: true,
      address: "Gulberg III, Lahore",
    },
  });

  // Category Data
  const category1 = await prisma.category.create({
    data: {
      name: "Main Course",
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: "Beverages",
    },
  });

  // MenuItems Data

  const menuItem1 = await prisma.menuItem.create({
    data: {
      name: "Chicken Biryani",
      description: "Spicy rice dish with tender chicken",
      price: 450,
      isAvailable: true,
      restaurantId: restaurant1.id,
      categoryId: category1.id,
    },
  });

  const menuItem2 = await prisma.menuItem.create({
    data: {
      name: "Beef Seekh Kebab",
      description: "Grilled minced beef skewers",
      price: 350,
      isAvailable: true,
      restaurantId: restaurant1.id,
      categoryId: category1.id,
    },
  });

  const menuItem3 = await prisma.menuItem.create({
    data: {
      name: "Coca-Cola",
      description: "500ml chilled bottle",
      price: 80,
      isAvailable: true,
      restaurantId: restaurant1.id,
      categoryId: category2.id,
    },
  });

    // Customer Data
  const customer1 = await prisma.customer.create({
    data: {
      name: "Ali Raza",
      email: "ali.raza@example.com",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Sara Khan",
      email: "sara.khan@example.com",
    },
  });

  // Address Data 
  const address1 = await prisma.address.create({
    data: {
      street: "House 12, Street 5, DHA Phase 6",
      city: "Karachi",
      customerId: customer1.id,
    },
  });


  // Rider 
  const rider1 = await prisma.rider.create({
    data:{

        name: "Bilal Ahmed",
         phoneNo: "0300-1234567",
          isAvailable: true

    }
  })


const rider2 = await prisma.rider.create({
  data: {
    name: "Usman Tariq",
    phoneNo: "0311-9876543",
    isAvailable: true,
  },
});

// Order Data

const order1 = await prisma.order.create({
  data: {
    customerId: customer1.id,
    restaurantId: restaurant1.id,
    riderId: rider1.id,
    status: "DELIVERED",
  },
});

const order2 = await prisma.order.create({
  data: {
    customerId: customer2.id,
    restaurantId: restaurant2.id,
    status: "PLACED",
  },
});

// Order items Data
const orderItem1 = await prisma.orderItem.create({
  data: {
    orderId: order1.id,
    menuItemId: menuItem1.id,
    quantity: 2,
    priceAtOrder: 450,
  },
});

const orderItem2 = await prisma.orderItem.create({
  data: {
    orderId: order1.id,
    menuItemId: menuItem3.id,
    quantity: 1,
    priceAtOrder: 80,
  },
});

// Review Data
const review1 = await prisma.review.create({
  data: {
    customerId: customer1.id,
    orderId: order1.id,
    targetType: "RESTAURANT",
    rating: 5,
    comment: "Amazing biryani, will order again!",
  },
});

const review2 = await prisma.review.create({
  data: {
    customerId: customer1.id,
    orderId: order1.id,
    targetType: "RIDER",
    rating: 4,
    comment: "Delivered quickly, very polite.",
  },
});

console.log("Seeding complete!");

}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

//     prisma.restaurant.create({ data: {...} }) — restaurant matches your model name (lowercased),
//     .create() inserts one new row, and everything inside data matches your schema's fields exactly.
//     We await it and store the result in restaurant1 — because we'll need restaurant1.id shortly,
//     to link a MenuItem to it.
//     The main().catch(...).finally(...) block at the bottom is boilerplate: run everything,
//     log any errors, and always disconnect from the database when done good practice,
