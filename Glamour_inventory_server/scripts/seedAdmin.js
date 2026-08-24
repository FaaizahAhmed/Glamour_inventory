import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/glamour-inventory';

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('✓ Admin account already exists:');
      console.log(`  Username: ${adminExists.username}`);
      console.log(`  Email: ${adminExists.email}`);
      await mongoose.connection.close();
      return;
    }

    // Create admin account
    const adminUser = new User({
      username: 'admin',
      email: 'admin@glamour.com',
      password: 'Admin@123', // Default password - CHANGE THIS!
      name: 'Admin User',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✓ Admin account created successfully!');
    console.log('  Username: admin');
    console.log('  Email: admin@glamour.com');
    console.log('  Password: Admin@123');
    console.log('  ⚠️  IMPORTANT: Change the password immediately after first login!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('✗ Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
