# LifeOS 🚀

LifeOS is a comprehensive, modern personal productivity dashboard built with the **MERN** stack (MongoDB, Express, React, Node.js). It's designed to be your all-in-one "operating system" for daily life, featuring advanced tracking for tasks, habits, journaling, and focus.

![LifeOS Dashboard](https://github.com/sameerahmadwd/lifeos/raw/main/client/src/assets/hero.png)

## ✨ Key Features

- **🔐 Robust Authentication**: Secure login, registration, and a full **Forgot Password** flow with email verification.
- **👤 Identity & Profile**: Customizable user profiles with unique avatars and multi-device synchronization.
- **🕒 Timezone-Aware Clock**: A dynamic header clock and greeting system that accurately reflects your local time, no matter where you are.
- **📝 Advanced Task Manager**: A Kanban-inspired split-board for pending and completed tasks with real-time filtering and a custom heatmap calendar.
- **📓 Clean Journaling (Notes)**: An Apple-Notes-inspired interface for daily reflections and journaling with auto-save and search.
- **🔥 Habits & Heatmaps**: Unlimited custom habits with individual color coding and infinite-scroll heatmap calendars for historical tracking.
- **🛡️ Activity Log**: Detailed session-by-session tracking (Login/Logout) stored in a dedicated database for security audits.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **Security**: JWT (JSON Web Tokens), bcryptjs (Password Hashing), SHA-256 (Token Hashing).
- **Messaging**: Nodemailer (SMTP/Gmail integration).

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (Local or Atlas)
- Gmail App Password (for email features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sameerahmadwd/lifeos.git
   cd lifeos
   ```

2. **Setup the Server**:
   ```bash
   cd server
   npm install
   # Create a .env file with your credentials:
   # PORT=5001
   # MONGO_URI=your_mongodb_uri
   # JWT_SECRET=your_secret
   # EMAIL_USER=your_email
   # EMAIL_PASS=your_app_password
   # CLIENT_URL=http://localhost:5173
   npm start
   ```

3. **Setup the Client**:
   ```bash
   cd ../client
   npm install
   # Create a .env file:
   # VITE_API_URL=http://localhost:5001/api
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*LifeOS — Organize your life, seamlessly.*
