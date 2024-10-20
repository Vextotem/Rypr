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

// Search for movies and series
router.get('/search', async (req, res) => {
    const { query, type } = req.query; // Expecting query and type (movie/tv)
    if (!query || !type) {
        return res.status(400).json({ error: 'Query and type are required' });
    }

    try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/${type}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: query,
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
