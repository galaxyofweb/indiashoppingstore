import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding IndiaShoppingStore database...')

  // ─── Admin User ───────────────────────────
  const adminPass = await bcrypt.hash('Admin@123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@indiashoppingstore.com' },
    update: {},
    create: {
      email: 'admin@indiashoppingstore.com',
      name: 'Admin User',
      passwordHash: adminPass,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      referralCode: 'ADMIN001',
      loyaltyPoints: 0,
    },
  })
  console.log('✅ Admin user:', admin.email)

  // ─── Categories ───────────────────────────
  const cats = [
    { name: "Women's Fashion", slug: 'women', icon: '👗', level: 0 },
    { name: "Men's Fashion",   slug: 'men',   icon: '👔', level: 0 },
    { name: 'Electronics',    slug: 'electronics', icon: '📱', level: 0 },
    { name: 'Home & Living',  slug: 'home',  icon: '🏠', level: 0 },
    { name: 'Beauty',         slug: 'beauty',icon: '✨', level: 0 },
    { name: 'Sports & Fitness',slug:'sports', icon: '🏋️', level: 0 },
    { name: 'Books',          slug: 'books', icon: '📚', level: 0 },
    { name: 'Toys & Kids',    slug: 'toys',  icon: '🧸', level: 0 },
  ]

  for (const cat of cats) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, level: cat.level, isActive: true },
    })
  }
  console.log('✅ Categories seeded')

  // ─── Brands ──────────────────────────────
  const brands = [
    { name: 'FabIndia', slug: 'fabindia' },
    { name: 'Biba', slug: 'biba' },
    { name: 'OnePlus', slug: 'oneplus' },
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Puma', slug: 'puma' },
    { name: 'Nike', slug: 'nike' },
    { name: 'IKEA', slug: 'ikea' },
    { name: 'Lakme', slug: 'lakme' },
  ]

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: { name: brand.name, slug: brand.slug, isActive: true },
    })
  }
  console.log('✅ Brands seeded')

  // ─── Sample Products ──────────────────────
  const womenCat = await prisma.category.findUnique({ where: { slug: 'women' } })
  const electronicsCat = await prisma.category.findUnique({ where: { slug: 'electronics' } })
  const fabIndia = await prisma.brand.findUnique({ where: { slug: 'fabindia' } })
  const samsung = await prisma.brand.findUnique({ where: { slug: 'samsung' } })

  const sampleProducts = [
    {
      name: 'Banarasi Silk Saree — Royal Blue',
      slug: 'banarasi-silk-saree-royal-blue',
      sku: 'ISS-SAR-001',
      price: 4999,
      comparePrice: 7999,
      stock: 50,
      categoryId: womenCat!.id,
      brandId: fabIndia!.id,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      isTrending: true,
      rating: 4.8,
      reviewCount: 124,
      salesCount: 342,
      gstRate: 5,
      hsnCode: '5007',
      status: 'ACTIVE' as const,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'],
      tags: ['saree', 'silk', 'ethnic', 'wedding', 'banarasi'],
      shortDescription: 'Exquisite Banarasi silk saree with intricate gold zari work. Perfect for weddings and festive occasions.',
    },
    {
      name: 'Samsung Galaxy S24 Ultra — Titanium Black',
      slug: 'samsung-galaxy-s24-ultra-titanium-black',
      sku: 'ISS-PHN-001',
      price: 124999,
      comparePrice: 134999,
      stock: 25,
      categoryId: electronicsCat!.id,
      brandId: samsung!.id,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      isTrending: true,
      rating: 4.7,
      reviewCount: 89,
      salesCount: 156,
      gstRate: 18,
      hsnCode: '8517',
      status: 'ACTIVE' as const,
      images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600'],
      tags: ['smartphone', 'samsung', 'android', '5g', 'flagship'],
      shortDescription: 'The ultimate Galaxy experience with S Pen, 200MP camera, and titanium build.',
    },
  ]

  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        thumbnail: product.images[0],
        currency: 'INR',
        lowStockAlert: 10,
        metaTitle: `${product.name} | IndiaShoppingStore`,
        metaDescription: product.shortDescription,
        viewCount: Math.floor(Math.random() * 5000),
      },
    })
  }
  console.log('✅ Sample products seeded')

  // ─── Coupons ─────────────────────────────
  const coupons = [
    { code: 'WELCOME10', type: 'PERCENTAGE' as const, value: 10, minOrderAmount: 500, maxDiscount: 200, usageLimit: 10000, description: '10% off for new customers' },
    { code: 'FREESHIP', type: 'FREE_SHIPPING' as const, value: 49, minOrderAmount: 199, description: 'Free shipping on any order' },
    { code: 'FLAT200', type: 'FIXED' as const, value: 200, minOrderAmount: 1000, description: '₹200 off on orders above ₹1,000' },
    { code: 'SAVE20', type: 'PERCENTAGE' as const, value: 20, minOrderAmount: 2000, maxDiscount: 500, description: '20% off on orders above ₹2,000' },
  ]

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: { ...coupon, isActive: true, usageCount: 0, perUserLimit: 1 },
    })
  }
  console.log('✅ Coupons seeded')

  // ─── Site Settings ────────────────────────
  const settings = [
    { key: 'site_name', value: 'IndiaShoppingStore', group: 'GENERAL' },
    { key: 'site_tagline', value: 'Premium Shopping, Indian Prices', group: 'GENERAL' },
    { key: 'currency', value: 'INR', group: 'GENERAL' },
    { key: 'free_shipping_threshold', value: '499', group: 'SHIPPING' },
    { key: 'standard_shipping_fee', value: '49', group: 'SHIPPING' },
    { key: 'cod_fee', value: '39', group: 'SHIPPING' },
    { key: 'seller_state', value: 'Delhi', group: 'GST' },
    { key: 'gstin', value: '07AABCI1234A1Z5', group: 'GST' },
    { key: 'loyalty_points_per_rupee', value: '0.1', group: 'LOYALTY' },
    { key: 'signup_bonus_points', value: '50', group: 'LOYALTY' },
    { key: 'review_bonus_points', value: '10', group: 'LOYALTY' },
    { key: 'referral_bonus_points', value: '100', group: 'LOYALTY' },
  ]

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }
  console.log('✅ Site settings seeded')

  console.log('\n🎉 Database seeded successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin login: admin@indiashoppingstore.com')
  console.log('Admin password: Admin@123456')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
