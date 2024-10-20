const express = require('express');
const axios = require('axios');

const router = express.Router();

// Middleware to handle errors
const handleError = (res, error) => {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
};

// TMDB API URL
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

// Helper function to construct image URLs
const getImageUrl = (path) => `https://image.tmdb.org/t/p/w500${path}`;

// GET trending movies this week
router.get('/trending/movies/week', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
            },
        });
        
        // Map the results to include the image URL
        const movies = response.data.results.map(movie => ({
            ...movie,
            poster_path: getImageUrl(movie.poster_path), // Add the image URL
        }));

        res.json({ ...response.data, results: movies });
    } catch (error) {
        handleError(res, error);
    }
});

// GET trending series this week
router.get('/trending/series/week', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/tv/week`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
            },
        });
        
        const series = response.data.results.map(tv => ({
            ...tv,
            poster_path: getImageUrl(tv.poster_path), // Add the image URL
        }));

        res.json({ ...response.data, results: series });
    } catch (error) {
        handleError(res, error);
    }
});

// GET popular movies
router.get('/popular/movies', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: 1,
            },
        });
        
        const movies = response.data.results.map(movie => ({
            ...movie,
            poster_path: getImageUrl(movie.poster_path), // Add the image URL
        }));

        res.json({ ...response.data, results: movies });
    } catch (error) {
        handleError(res, error);
    }
});

// GET popular series
router.get('/popular/series', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: 1,
            },
        });

        const series = response.data.results.map(tv => ({
            ...tv,
            poster_path: getImageUrl(tv.poster_path), // Add the image URL
        }));

        res.json({ ...response.data, results: series });
    } catch (error) {
        handleError(res, error);
    }
});

// GET movie trailers
router.get('/movies/:id/videos', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}/videos`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
            },
        });
        res.json(response.data);
    } catch (error) {
        handleError(res, error);
    }
});

// Add other endpoints (trending networks, top-rated series, etc.) in a similar fashion...

module.exports = router;
