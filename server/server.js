const cron = require('node-cron');
const notificationService = require('./services/notificationService');
const notificationRoutes = require('./routes/notifications');

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
const habitRoutes = require('./routes/habits'); 
const noteRoutes = require('./routes/notes'); 
const taskRoutes = require('./routes/tasks'); 
const profileRoutes = require('./routes/profile');
const forgotPasswordRoutes = require('./routes/forgotPassword');
const logRoutes = require('./routes/log'); 
const settingsRoutes = require('./routes/settings'); 
const goalRoutes = require('./routes/goals');

app.use('/api/auth', authRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes); 
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/habits', habitRoutes); 
app.use('/api/notes', noteRoutes); 
app.use('/api/tasks', taskRoutes); 
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);

const sessionRoutes = require('./routes/session');

// ... (other route registrations) ...
app.use('/api/log', logRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/goals', goalRoutes);

// --- Background Automation Jobs (Interval) ---
const Task = require('./models/Task');
const Setting = require('./models/Setting');
const Session = require('./models/Session');
const User = require('./models/User');
const Habit = require('./models/Habit');

const runAutomations = async () => {
  try {
    const settings = await Setting.findOne({ identifier: 'global' });
    if (!settings) return;

    // 1. Auto-archive completed tasks
    const archiveThreshold = new Date();
    archiveThreshold.setDate(archiveThreshold.getDate() - (settings.autoArchiveTasksDays || 30));

    const taskResult = await Task.updateMany(
      { completed: true, updatedAt: { $lt: archiveThreshold }, archived: { $ne: true } },
      { $set: { archived: true } }
    );
    if (taskResult.modifiedCount > 0) {
      console.log(`[Automation] Archived ${taskResult.modifiedCount} old tasks.`);
    }

    // 2. Auto-close stale active sessions (no heartbeat for > 2 mins)
    const sessionThreshold = new Date(Date.now() - 2 * 60 * 1000); 
    const sessionResult = await Session.updateMany(
      { status: 'active', lastActiveAt: { $lt: sessionThreshold } },
      { $set: { status: 'closed', endTime: new Date() } }
    );
    if (sessionResult.modifiedCount > 0) {
      console.log(`[Automation] Closed ${sessionResult.modifiedCount} stale sessions.`);
    }
    // 3. Procrastination Alert (tasks pending > 3 days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const procrastinatedTasks = await Task.find({ 
        completed: false, 
        createdAt: { $lt: threeDaysAgo },
        notifiedProcrastination: { $ne: true }
    });

    for (const task of procrastinatedTasks) {
        await notificationService.createNotification(task.user, {
            type: 'task',
            priority: 'low',
            title: 'Gentle Nudge',
            message: `"${task.text}" has been pending for a while. Want to tackle it today?`,
            actionUrl: '/tasks'
        });
        task.notifiedProcrastination = true;
        await task.save();
    }
  } catch (err) {

    console.error('[Automation] Error:', err);
  }
};

// Run every hour
setInterval(runAutomations, 1000 * 60 * 60);

// --- CRON JOBS (Scheduled) ---

// 1. Morning Summary (Daily at 8:00 AM)
cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Running Morning Summary...');
    const users = await User.find({ lastActiveAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } });
    for (const user of users) {
        const today = new Date().toISOString().split('T')[0];
        const taskCount = await Task.countDocuments({ user: user._id, date: today, completed: false });
        if (taskCount > 0) {
            await notificationService.createNotification(user._id, {
                type: 'dashboard',
                priority: 'medium',
                title: 'Morning Briefing',
                message: `Good morning! You have ${taskCount} tasks waiting for you today. Let's make it productive!`,
                actionUrl: '/tasks'
            });
        }
    }
});

// 2. Night Summary (Daily at 9:30 PM)
cron.schedule('30 21 * * *', async () => {
    console.log('[Cron] Running Night Summary...');
    const users = await User.find({ lastActiveAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } });
    for (const user of users) {
        const today = new Date().toISOString().split('T')[0];
        const completedCount = await Task.countDocuments({ user: user._id, date: today, completed: true });
        if (completedCount > 0) {
            await notificationService.createNotification(user._id, {
                type: 'dashboard',
                priority: 'low',
                title: 'Daily Reflection',
                message: `You completed ${completedCount} tasks today. Great work! Time to unwind and reflect.`,
                actionUrl: '/dashboard'
            });
        }
    }
});

// 3. Weekly Progress (Sunday at 6:00 PM)
cron.schedule('0 18 * * 0', async () => {
    console.log('[Cron] Running Weekly Progress...');
    const users = await User.find({});
    for (const user of users) {
        await notificationService.createNotification(user._id, {
            type: 'goal',
            priority: 'medium',
            title: 'Weekly Report Ready',
            message: 'Your weekly progress summary is ready. See how you did this week!',
            actionUrl: '/goals'
        });
    }
});

// Ensure the server listens on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

