const express = require('express');
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

// Use the movies router for API endpoints
app.use('/api/movies', moviesRouter);

// Catch-all route for unmatched requests
app.get('*', (req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' }); // Added success field
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
