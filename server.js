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
const moviesRouter = require('./src/routes/movie');
const browseRouter = require('./src/routes/browse');
const seriesRouter = require('./src/routes/series');
const episodesRouter = require('./src/routes/episodes');
const searchRouter = require('./src/routes/search');
const trailerRouter = require('./src/routes/trailer'); // Import the trailer router

// Use the routers for API endpoints
app.use('/api/movie', moviesRouter);
app.use('/api/browse', browseRouter);
app.use('/api/series', seriesRouter);
app.use('/api/episodes', episodesRouter);
app.use('/api/search', searchRouter);
app.use('/api/trailer', trailerRouter); // Add the trailer route

// Catch-all route for unmatched requests
app.get('*', (req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
