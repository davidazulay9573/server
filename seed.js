const mongoose = require('mongoose');
const { User } = require('./model/user'); 

exports.seedDB = async () => {
  const users = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: '1234',
      phone: 1234567890,
      role: 'user',
      status: 'active',
      balance: 1000,
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: '1234',
      phone: 9876543210,
      role: 'user',
      status: 'active',
      balance: 1000,
    },
      {
      name: 'Jane1 Smith',
      email: 'jane1@example.com',
      password: '1234',
      phone: 9876543210,
      role: 'user',
      status: 'active',
      balance: 1000,
    }
   
  ];

  try {
    await User.insertMany(users);
    console.log('Database seeded with users.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
}
