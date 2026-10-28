/* eslint-disable no-console */
/**
 * ZiwiShop demo data seeder.
 * Usage: npm run seed
 * WARNING: this script wipes the collections it manages before inserting demo data.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/user");
const Brand = require("./models/brand");
const Size = require("./models/size");
const Category = require("./models/category");
const Image = require("./models/image");
const Product = require("./models/product");
const Order = require("./models/order");

const DB = process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD);

const imageUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const catalog = [
  {
    name: "Classic Cotton T-Shirt",
    description: "Soft combed cotton crew neck tee with a relaxed everyday fit.",
    price: 29,
    brand: "Nike",
    category: "T-Shirts",
    sizes: ["S", "M", "L", "XL"],
    countInStock: 42,
    images: [imageUrl("photo-1521572163474-6864f9cf17ab")],
  },
  {
    name: "Oversized Graphic Tee",
    description: "Heavyweight oversized t-shirt with a minimal chest print.",
    price: 39,
    brand: "Adidas",
    category: "T-Shirts",
    sizes: ["M", "L", "XL"],
    countInStock: 25,
    images: [imageUrl("photo-1523381210434-271e8be1f52b")],
  },
  {
    name: "Biker Leather Jacket",
    description: "Cropped biker jacket in smooth faux leather with silver hardware.",
    price: 189,
    brand: "Zara",
    category: "Jackets",
    sizes: ["S", "M", "L"],
    countInStock: 12,
    images: [imageUrl("photo-1551028719-00167b16eac5")],
  },
  {
    name: "Lightweight Bomber",
    description: "Water resistant bomber jacket with ribbed cuffs and collar.",
    price: 129,
    brand: "Adidas",
    category: "Jackets",
    sizes: ["M", "L", "XL"],
    countInStock: 18,
    images: [imageUrl("photo-1591047139829-d91aecb6caea")],
  },
  {
    name: "Slim Fit Denim",
    description: "Stretch denim with a modern slim leg and mid-rise waist.",
    price: 79,
    brand: "Levi's",
    category: "Jeans",
    sizes: ["S", "M", "L", "XL"],
    countInStock: 30,
    images: [imageUrl("photo-1594633312681-425c7b97ccd1")],
  },
  {
    name: "Straight Leg Jeans",
    description: "Rigid cotton denim with a straight leg and classic five pockets.",
    price: 89,
    brand: "Levi's",
    category: "Jeans",
    sizes: ["M", "L", "XL"],
    countInStock: 21,
    images: [imageUrl("photo-1541099649105-f69ad21f3246")],
  },
  {
    name: "Silk Slip Dress",
    description: "Bias cut midi dress in satin finish with adjustable straps.",
    price: 149,
    brand: "Zara",
    category: "Dresses",
    sizes: ["XS", "S", "M", "L"],
    countInStock: 14,
    images: [imageUrl("photo-1490481651871-ab68de25d43d")],
  },
  {
    name: "Ribbed Knit Sweater",
    description: "Chunky rib knit sweater with a mock neck and dropped shoulders.",
    price: 69,
    brand: "Zara",
    category: "Sweaters",
    sizes: ["S", "M", "L"],
    countInStock: 27,
    images: [imageUrl("photo-1434389677669-e08b4cac3105")],
  },
  {
    name: "Leather Shoulder Bag",
    description: "Structured shoulder bag in pebbled leather with gold tone clasp.",
    price: 259,
    brand: "Gucci",
    category: "Handbags",
    sizes: ["S", "M"],
    countInStock: 8,
    images: [imageUrl("photo-1483985988355-763728e1935b")],
  },
];

const categories = {
  Men: ["T-Shirts", "Jackets", "Jeans"],
  Women: ["Dresses", "Sweaters", "Handbags"],
};

const brands = ["Nike", "Adidas", "Zara", "Gucci", "Levi's"];
const sizes = [
  { name: "XS", value: "XS" },
  { name: "S", value: "S" },
  { name: "M", value: "M" },
  { name: "L", value: "L" },
  { name: "XL", value: "XL" },
];

async function seed() {
  await mongoose.connect(DB, { useUnifiedTopology: true, useNewUrlParser: true });
  console.log("Connected to MongoDB");

  await Promise.all([
    Order.deleteMany({}),
    Product.deleteMany({}),
    Image.deleteMany({}),
    Category.deleteMany({}),
    Size.deleteMany({}),
    Brand.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log("Existing demo data cleared");

  const [, , customerUser] = await User.create([
    {
      name: "ZiwiShop Admin",
      email: "admin@ziwishop.com",
      password: await bcrypt.hash("Admin123!", 8),
      role: "ADMIN",
      verified: true,
    },
    {
      name: "ZiwiShop Guest Admin",
      email: "ziwiShop@gmail.com",
      password: await bcrypt.hash("ziwiShop0000", 8),
      role: "ADMIN",
      verified: true,
    },
    {
      name: "Demo Customer",
      email: "user@ziwishop.com",
      password: await bcrypt.hash("User123!", 8),
      role: "USER",
      verified: true,
    },
  ]);

  const brandDocs = await Brand.insertMany(brands.map((name) => ({ name })));
  const brandByName = new Map(brandDocs.map((brand) => [brand.name, brand._id]));

  const sizeDocs = await Size.insertMany(sizes);
  const sizeByName = new Map(sizeDocs.map((size) => [size.name, size._id]));

  const categoryByName = new Map();
  for (const [parentName, childNames] of Object.entries(categories)) {
    const parent = await Category.create({ name: parentName, isLeaf: false });
    for (const childName of childNames) {
      const child = await Category.create({
        name: childName,
        parentCategory: parent._id,
        isLeaf: true,
      });
      categoryByName.set(childName, child._id);
    }
  }

  const products = [];
  for (let index = 0; index < catalog.length; index += 1) {
    const item = catalog[index];
    const images = await Image.insertMany(
      item.images.map((url, imageIndex) => ({
        url,
        cloudinary_id: `ziwishop-seed/${index}-${imageIndex}`,
      }))
    );

    const product = await Product.create({
      name: item.name,
      description: item.description,
      price: item.price,
      category: categoryByName.get(item.category),
      sizes: item.sizes.map((name) => sizeByName.get(name)),
      images: images.map((image) => image._id),
      countInStock: item.countInStock,
      brand: brandByName.get(item.brand),
      isFeatured: true,
      isArchived: false,
    });
    products.push(product);
  }

  const orderSeeds = [
    { items: [products[0], products[2]], daysAgo: 1, paid: true },
    { items: [products[4]], daysAgo: 2, paid: true },
    { items: [products[6], products[8]], daysAgo: 4, paid: false },
  ];

  for (const orderSeed of orderSeeds) {
    const orderItems = orderSeed.items.map((product) => ({
      name: product.name,
      quantity: 1,
      images: product.images,
      price: product.price,
      product: product._id,
    }));
    const itemsPrice = orderItems.reduce((sum, item) => sum + item.price, 0);
    const shippingPrice = 12;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - orderSeed.daysAgo);

    const order = await Order.create({
      orderItems,
      shippingAddress: {
        fullName: "Demo Customer",
        country: "United States",
        city: "New York",
        state: "NY",
        street1: "221B Baker Street",
        zipCode: 10001,
      },
      paymentMethod: "cash",
      itemsPrice,
      shippingPrice,
      totalPrice: itemsPrice + shippingPrice,
      user: customerUser._id,
      userEmail: customerUser.email,
      userPhone: 1234567890,
      isPaid: orderSeed.paid,
      paidAt: orderSeed.paid ? createdAt : undefined,
    });

    // Backdate the demo order so the weekly overview chart has data
    await Order.updateOne({ _id: order._id }, { $set: { createdAt } }, { timestamps: false });
  }

  console.log(`Seeded ${brandDocs.length} brands, ${sizeDocs.length} sizes, ${catalog.length} products`);
  console.log("Admin account: admin@ziwishop.com / Admin123!");
  console.log("Guest admin account: ziwiShop@gmail.com / ziwiShop0000");
  console.log("Customer account: user@ziwishop.com / User123!");

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(async (error) => {
  console.error("Seeding failed:", error);
  await mongoose.connection.close();
  process.exit(1);
});
