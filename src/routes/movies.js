const express = require('express');
const axios = require('axios');
const router = express.Router();

// TMDB API URL
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Middleware to handle errors
const handleError = (res, error) => {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
};

// GET trending movies this week
router.get('/trending/movies/week', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
            },
        });
        res.json(response.data);
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
        res.json(response.data);
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
        res.json(response.data);
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
        res.json(response.data);
    } catch (error) {
        handleError(res, error);
    }
});

// GET trending networks
router.get('/trending/networks', async (req, res) => {
    // TMDB API does not have a direct endpoint for trending networks,
    // you may need to get this from trending series as a workaround
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/tv/week`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
            },
        });
        const networks = response.data.results.map(series => series.networks).flat();
        const uniqueNetworks = [...new Set(networks.map(network => JSON.stringify(network)))].map(network => JSON.parse(network));
        res.json(uniqueNetworks);
    } catch (error) {
        handleError(res, error);
    }
});

// GET top rated series
router.get('/top-rated/series', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/tv/top_rated`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: 1,
            },
        });
        res.json(response.data);
    } catch (error) {
        handleError(res, error);
    }
});

// GET top rated movies
router.get('/top-rated/movies', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: 1,
            },
        });
        res.json(response.data);
    } catch (error) {
        handleError(res, error);
    }
});

// GET upcoming movies
router.get('/upcoming/movies', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: 1,
            },
        });
        res.json(response.data);
    } catch (error) {
        handleError(res, error);
    }
});

// GET upcoming series
router.get('/upcoming/series', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/tv/on_the_air`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: 1,
            },
        });
        res.json(response.data);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
