const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subject'); // <-- Shto këtë

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Lidhja me DB
connectDB();

// Rrugët
app.use('/api', authRoutes);
app.use('/api/subjects', subjectRoutes); // <-- Dhe këtë

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));