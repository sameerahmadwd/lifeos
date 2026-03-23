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
const habitRoutes = require('./routes/habits'); // Renamed from habitsRoutes
const noteRoutes = require('./routes/notes'); // Renamed from notesRoutes
const taskRoutes = require('./routes/tasks'); // Renamed from tasksRoutes
const profileRoutes = require('./routes/profile');
const forgotPasswordRoutes = require('./routes/forgotPassword');
const logRoutes = require('./routes/log'); // Added
const settingsRoutes = require('./routes/settings'); // Added

app.use('/api/auth', authRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes); // Path changed
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/habits', habitRoutes); // Renamed
app.use('/api/notes', noteRoutes); // Renamed
app.use('/api/tasks', taskRoutes); // Renamed
app.use('/api/profile', profileRoutes);
app.use('/api/log', logRoutes); // Added
app.use('/api/settings', settingsRoutes); // Added

// --- Background Automation Jobs ---
const Task = require('./models/Task');
const Setting = require('./models/Setting');

const runAutomations = async () => {
  try {
    const settings = await Setting.findOne({ identifier: 'global' });
    if (!settings) return;

    // 1. Auto-archive completed tasks
    const archiveThreshold = new Date();
    archiveThreshold.setDate(archiveThreshold.getDate() - settings.autoArchiveTasksDays);

    const result = await Task.updateMany(
      { completed: true, updatedAt: { $lt: archiveThreshold }, archived: { $ne: true } },
      { $set: { archived: true } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Automation] Archived ${result.modifiedCount} old tasks.`);
    }
  } catch (err) {
    console.error('[Automation] Error:', err);
  }
};

// Run every hour
setInterval(runAutomations, 1000 * 60 * 60);
// Also run on startup after a small delay
setTimeout(runAutomations, 5000);

// Ensure the server listens on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
