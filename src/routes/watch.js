// src/routes/watch.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Use your environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// Fetch movie/series/episode details based on id, type and episode number (if applicable)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { type, season, episode } = req.query; // type, season, and episode query parameters

    try {
        let endpoint = '';
        
        // Handle movie type
        if (type === 'movie') {
            endpoint = `/movie/${id}`;
        } 
        // Handle TV series type
        else if (type === 'tv') {
            endpoint = `/tv/${id}`;
        } 
        // Handle episode type (requires season number and episode number)
        else if (type === 'episode' && season && episode) {
            endpoint = `/tv/${id}/season/${season}/episode/${episode}`;
        } else {
            return res.status(400).json({ success: false, error: 'Invalid type. Must be "movie", "tv", or "episode"' });
        }

        // Make the request to TMDB API
        const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
            }
        });

        // Return the movie, series, or episode details
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
