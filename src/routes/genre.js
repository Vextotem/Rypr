// src/routes/genre.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Use your environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// Fetch movies or series by genre
router.get('/:type/:id', async (req, res) => {
    const { type, id } = req.params; // Extract type (movie/tv) and genre ID

    try {
        let endpoint = '';

        if (type === 'movie') {
            endpoint = `/discover/movie`;
        } else if (type === 'tv') {
            endpoint = `/discover/tv`;
        } else {
            return res.status(400).json({ success: false, error: 'Invalid type. Must be "movie" or "tv"' });
        }

        // Fetch data from TMDB for a specific genre
        const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
            params: {
                api_key: TMDB_API_KEY,
                with_genres: id, // Pass genre ID
                language: 'en-US',
            }
        });

        // Return the movies or series for the specified genre
        res.json({
            success: true,
            data: response.data.results,
        });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch data' });
    }
});

module.exports = router;
