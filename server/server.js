const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const seedUser = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lifeos')
  .then(async () => {
    console.log('Connected to MongoDB lifeos');
    // Run the seeder function to ensure default user exists
    await seedUser();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Granular Routes
const dashboardRoutes = require('./routes/dashboard');
const habitsRoutes = require('./routes/habits');
const notesRoutes = require('./routes/notes');
const tasksRoutes = require('./routes/tasks');
const profileRoutes = require('./routes/profile');
const forgotPasswordRoutes = require('./routes/forgotPassword');

app.use('/api/auth', authRoutes);
app.use('/api/auth', forgotPasswordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/profile', profileRoutes);

// Ensure the server listens on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
