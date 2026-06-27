const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const path = require('path');
const http       = require('http');
const { initSocket } = require('./sockets/socket');
const { startCronJobs } = require('./services/cronService')
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();


// Initialize Express app
const app = express();
const server = http.createServer(app);
const io     = initSocket(server);
app.set('io', io);
app.set("trust proxy", 1);

const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://gig-xpress-wu8e.vercel.app",
  "https://gig-xpress-delta.vercel.app",
  ...envOrigins
];
// Middleware
console.log("Allowed frontend origins:", allowedOrigins);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
}));
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5000',
//   credentials: true
// }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/organizers', require('./routes/organizerRoutes'));

app.use('/api/workers', require('./routes/WorkerRoute'));

app.use('/api/admin',       require('./routes/adminRoutes'));
app.use('/api/kyc',         require('./routes/kycRoutes'));

app.use('/api/chat',         require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.use('/api/payments',     require('./routes/paymentRoutes'));


// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO enabled`);
  console.log(`💳 Razorpay payments enabled`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  startCronJobs();
});
