const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const http = require('http');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lifeos');
  const user = await User.findOne({ name: 'Sameer' });
  if(!user) return console.log('no user');
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
  
  const options = {
    hostname: '127.0.0.1',
    port: process.env.PORT || 5001,
    path: '/api/notes',
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', d => process.stdout.write(d));
    res.on('end', () => process.exit(0));
  });
  
  req.on('error', error => {
    console.error(error);
    process.exit(1);
  });
  
  req.write(JSON.stringify({ title: 'Terminal Diagnositic', content: 'Testing route directly safely!' }));
  req.end();
}
run();
