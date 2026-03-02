const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Leadsphere uses bcryptjs not bcrypt
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/leadsphere')
  .then(async () => {
    const user = await User.findOne({ email: 'admin@leadsphere.com' }).select('+password');
    if (!user) {
      console.log('User not found');
      process.exit(0);
    }
    
    console.log('Testing admin123...');
    const match1 = await user.matchPassword('admin123');
    console.log('Match admin123:', match1);

    console.log('Testing admin...');
    const match2 = await user.matchPassword('admin');
    console.log('Match admin:', match2);

    process.exit(0);
  });
