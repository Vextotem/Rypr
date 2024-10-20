const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enables CORS for all origins
app.use(express.json()); // Parses JSON request bodies
app.use(helmet()); // Adds security-related HTTP headers

// Import routes
const moviesRouter = require('./src/routes/movies');

// Middleware to handle errors
const handleError = (res, error) => {
    console.error('Error details:', error);
    if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Status:', error.response.status);
    } else {
        console.error('Error message:', error.message);
    }
    res.status(500).json({ error: 'Failed to fetch data' });
};

// Use the movies router for API endpoints
app.use('/api/movies', moviesRouter);

// Catch-all route for unmatched requests
app.get('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
