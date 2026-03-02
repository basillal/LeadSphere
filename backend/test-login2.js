const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/leadsphere')
  .then(async () => {
    const user = await User.findOne({ email: 'admin@leadsphere.com' }).select('+password');
    if (!user) {
      console.log('User not found');
      process.exit(0);
    }
    
    // Let's reset the password directly to 'admin123' to ensure it's correct
    user.password = 'admin123';
    await user.save();
    console.log('Password reset to admin123');
    
    process.exit(0);
  });
