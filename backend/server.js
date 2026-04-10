const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const path = require('path');
const http       = require('http');
const { initSocket } = require('./sockets/socket');
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();


// Initialize Express app
const app = express();
const server = http.createServer(app);
const io     = initSocket(server);
app.set('io', io);


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://gig-xpress-wu8e.vercel.app"
];
// Middleware
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed: " + origin));
    }
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
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});