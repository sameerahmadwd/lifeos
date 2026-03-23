const mongoose = require('mongoose');
const User = require('./models/User');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/lifeos');
  const user = await User.findOne({ email: 'sameerahmadsaifi@gmail.com' });
  if (!user) {
    console.log('User not found');
  } else {
    console.log('User found:', user.email);
    console.log('Hashed Password:', user.password);
    const match = await user.matchPassword('Ahmad@123#');
    console.log('Password Match with Ahmad@123#:', match);
    const match2 = await user.matchPassword('Ahmad@123# ');
    console.log('Match with trailing space:', match2);
  }
  process.exit(0);
}
test();
