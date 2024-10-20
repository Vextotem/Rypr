// server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const moviesRouter = require('./src/routes/movies'); // Adjust the path if necessary

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Use the movies router
app.use('/api/movies', moviesRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
