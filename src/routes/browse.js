// browse.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper function to fetch movies
const fetchMovies = async () => {
    const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                sort_by: 'popularity.desc',
                page: 1,
            },
        });
        return response.data.results.map(item => ({
            id: item.id,
            title: item.title,
            poster_path: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        }));
    } catch (error) {
        throw new Error('Error fetching movies from TMDB');
    }
};

// Define /browse route
router.get('/browse', async (req, res) => {
    try {
        const movies = await fetchMovies();
        res.json({
            success: true,
            data: {
                movies: movies,  // Return the movie data
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
