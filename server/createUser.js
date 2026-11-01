require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const User = require('./models/User'); 

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const hash = await bcrypt.hash('YourPassword123', 10);
  await User.create({ username: 'admin', password: hash });
  console.log('User created');
  process.exit();
})();
