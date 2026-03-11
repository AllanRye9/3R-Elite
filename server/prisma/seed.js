const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: '📱' },
  { name: 'Clothing', slug: 'clothing', icon: '👕' },
  { name: 'Home & Garden', slug: 'home-garden', icon: '🏡' },
  { name: 'Sports', slug: 'sports', icon: '⚽' },
  { name: 'Vehicles', slug: 'vehicles', icon: '🚗' },
  { name: 'Books', slug: 'books', icon: '📚' },
  { name: 'Toys', slug: 'toys', icon: '🧸' },
  { name: 'Beauty', slug: 'beauty', icon: '💄' },
  { name: 'Food', slug: 'food', icon: '🍎' },
  { name: 'Services', slug: 'services', icon: '🔧' },
  { name: 'Art', slug: 'art', icon: '🎨' },
  { name: 'Other', slug: 'other', icon: '📦' },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('Categories seeded.');

  console.log('Seeding demo users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      password: hashedPassword,
      name: 'Alice Johnson',
      bio: 'Passionate seller of quality goods.',
      location: 'New York, NY',
      avatar: 'https://picsum.photos/seed/alice/200',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      password: hashedPassword,
      name: 'Bob Smith',
      bio: 'Tech enthusiast and gadget seller.',
      location: 'San Francisco, CA',
      avatar: 'https://picsum.photos/seed/bob/200',
    },
  });

  console.log('Demo users created:', user1.email, user2.email);

  // Seed sample products
  const electronicsCategory = await prisma.category.findUnique({ where: { slug: 'electronics' } });
  const clothingCategory = await prisma.category.findUnique({ where: { slug: 'clothing' } });

  if (electronicsCategory) {
    await prisma.product.upsert({
      where: { id: 'sample-product-1' },
      update: {},
      create: {
        id: 'sample-product-1',
        title: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
        price: 79.99,
        images: ['https://picsum.photos/seed/headphones/400/300'],
        stock: 5,
        condition: 'new',
        sellerId: user1.id,
        categoryId: electronicsCategory.id,
      },
    });

    await prisma.product.upsert({
      where: { id: 'sample-product-2' },
      update: {},
      create: {
        id: 'sample-product-2',
        title: 'Smartphone Stand & Charger',
        description: 'Versatile smartphone stand with built-in wireless charging pad.',
        price: 34.99,
        images: ['https://picsum.photos/seed/charger/400/300'],
        stock: 10,
        condition: 'new',
        sellerId: user2.id,
        categoryId: electronicsCategory.id,
      },
    });
  }

  if (clothingCategory) {
    await prisma.product.upsert({
      where: { id: 'sample-product-3' },
      update: {},
      create: {
        id: 'sample-product-3',
        title: 'Classic Denim Jacket',
        description: 'Timeless denim jacket, lightly worn, size M. Great condition.',
        price: 45.00,
        images: ['https://picsum.photos/seed/jacket/400/300'],
        stock: 1,
        condition: 'used',
        sellerId: user1.id,
        categoryId: clothingCategory.id,
      },
    });
  }

  console.log('Sample products created.');
  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
