// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware
const corsOptions = {
  origin: 'https://klinik-app-frontend.vercel.app', // Ganti dengan URL frontend Vercel Anda
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// JSON Body Parser
app.use(express.json());

// MongoDB Atlas Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas!');
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err.message);
    process.exit(1);
  }
};
connectDB();

// API Routes
app.get('/api/service', (req, res) => {
  console.log('GET /api/service received.');
  // Your logic to fetch service data from database
  res.status(200).json([
    { id: 1, name: 'Pemeriksaan Umum', price: 150000 },
    { id: 2, name: 'Vaksinasi Flu', price: 200000 }
  ]);
});

app.post('/api/booking', (req, res) => {
  console.log('POST /api/booking received. Data:', req.body);
  // Your logic to save booking data to database
  if (req.body.patientName && req.body.serviceId) {
    res.status(201).json({ message: 'Booking successful!', booking: req.body });
  } else {
    res.status(400).json({ message: 'Incomplete booking data.' });
  }
});

app.post('/api/chat', (req, res) => {
  console.log('POST /api/chat received. Message:', req.body.message);
  // Your logic to process chat message
  if (req.body.message) {
    const userMessage = req.body.message;
    let botResponse = "Sorry, I don't understand. Can you repeat?";
    if (userMessage.toLowerCase().includes("halo")) {
      botResponse = "Hello! How can I help you?";
    } else if (userMessage.toLowerCase().includes("jadwal")) {
        botResponse = "You can see the doctor's schedule on our main page or through the 'Booking' menu.";
    }
    res.status(200).json({ response: botResponse });
  } else {
    res.status(400).json({ message: 'Empty message.' });
  }
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong on the server!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Vercel Backend URL: ${process.env.VERCEL_URL || 'Not deployed yet'}/api`);
});