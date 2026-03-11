import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: '📱' },
    { name: 'Vehicles', slug: 'vehicles', icon: '🚗' },
    { name: 'Real Estate', slug: 'real-estate', icon: '🏠' },
    { name: 'Jobs', slug: 'jobs', icon: '💼' },
    { name: 'Services', slug: 'services', icon: '🔧' },
    { name: 'Fashion', slug: 'fashion', icon: '👗' },
    { name: 'Home & Garden', slug: 'home-garden', icon: '🏡' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: '⚽' },
    { name: 'Kids & Baby', slug: 'kids-baby', icon: '🧒' },
    { name: 'Books & Education', slug: 'books-education', icon: '📚' },
    { name: 'Food & Beverages', slug: 'food-beverages', icon: '🍔' },
    { name: 'Health & Beauty', slug: 'health-beauty', icon: '💄' },
  ];

  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });

    // Subcategories
    if (cat.slug === 'electronics') {
      const subs = [
        { name: 'Mobile Phones', slug: 'mobile-phones' },
        { name: 'Laptops & Computers', slug: 'laptops-computers' },
        { name: 'TVs & Screens', slug: 'tvs-screens' },
        { name: 'Audio & Music', slug: 'audio-music' },
        { name: 'Cameras', slug: 'cameras' },
        { name: 'Gaming', slug: 'gaming' },
      ];
      for (const sub of subs) {
        await prisma.category.upsert({
          where: { slug: sub.slug },
          update: {},
          create: { ...sub, parentId: parent.id, icon: cat.icon },
        });
      }
    } else if (cat.slug === 'vehicles') {
      const subs = [
        { name: 'Cars', slug: 'cars' },
        { name: 'Motorcycles', slug: 'motorcycles' },
        { name: 'Trucks', slug: 'trucks' },
        { name: 'Boats', slug: 'boats' },
        { name: 'Spare Parts', slug: 'spare-parts' },
      ];
      for (const sub of subs) {
        await prisma.category.upsert({
          where: { slug: sub.slug },
          update: {},
          create: { ...sub, parentId: parent.id, icon: cat.icon },
        });
      }
    } else if (cat.slug === 'real-estate') {
      const subs = [
        { name: 'Apartments for Rent', slug: 'apartments-rent' },
        { name: 'Apartments for Sale', slug: 'apartments-sale' },
        { name: 'Villas', slug: 'villas' },
        { name: 'Commercial', slug: 'commercial' },
        { name: 'Land', slug: 'land' },
      ];
      for (const sub of subs) {
        await prisma.category.upsert({
          where: { slug: sub.slug },
          update: {},
          create: { ...sub, parentId: parent.id, icon: cat.icon },
        });
      }
    }
  }

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123!', 12);
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('WARNING: ADMIN_PASSWORD env var not set. Using default password — change this in production!');
  }
  await prisma.user.upsert({
    where: { email: 'admin@3relite.com' },
    update: {},
    create: {
      email: 'admin@3relite.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      country: 'UAE',
      isVerified: true,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
