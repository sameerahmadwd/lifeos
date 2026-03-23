const User = require('./models/User');

const seedUser = async () => {
  try {
    const seedEmail = 'sameerahmadsaifi@gmail.com';
    const existingUser = await User.findOne({ email: seedEmail });
    
    if (!existingUser) {
      const user = await User.create({
        name: 'Sameer',
        email: seedEmail,
        password: 'Ahmad@123#'
      });
      console.log('✅ Default user (Sameer) successfully seeded into the database');
    } else {
      console.log('ℹ️ Default user (Sameer) already exists in the database');
    }
  } catch (error) {
    console.error('❌ Error seeding default user:', error.message);
  }
};

module.exports = seedUser;
