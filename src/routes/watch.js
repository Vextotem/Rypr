// src/routes/watch.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Use your environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// Fetch movie/series details
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { type } = req.query; // Type could be "movie" or "tv" for series

    try {
        let endpoint = '';
        if (type === 'movie') {
            endpoint = `/movie/${id}`;
        } else if (type === 'tv') {
            endpoint = `/tv/${id}`;
        } else {
            return res.status(400).json({ success: false, error: 'Invalid type. Must be "movie" or "tv"' });
        }

        const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
            }
        });

        // Return the movie or series details
        res.json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch data' });
    }
});

module.exports = router;