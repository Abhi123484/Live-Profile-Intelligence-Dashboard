require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/profile_dashboard';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'developer123@gmail.com' });

    if (existingAdmin) {
      // Update to admin if not already
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ Admin user already exists — role updated to admin.');
    } else {
      const passwordHash = await bcrypt.hash('Developer', 10);
      const admin = new User({
        name: 'Admin',
        email: 'developer123@gmail.com',
        passwordHash,
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Default admin created successfully!');
    }

    console.log('   Email: developer123@gmail.com');
    console.log('   Password: Developer');
    console.log('   Role: admin');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
    process.exit(1);
  }
};

seedAdmin();
