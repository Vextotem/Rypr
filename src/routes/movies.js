const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// TMDB API URL
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Middleware to handle errors
const handleError = (res, error) => {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
};

// GET trending movies this week
app.get('/api/movies/trending/movies/week', async (req, res) => {
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
app.get('/api/movies/trending/series/week', async (req, res) => {
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
app.get('/api/movies/popular/movies', async (req, res) => {
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
app.get('/api/movies/popular/series', async (req, res) => {
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
app.get('/api/movies/trending/networks', async (req, res) => {
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
app.get('/api/movies/top-rated/series', async (req, res) => {
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
app.get('/api/movies/top-rated/movies', async (req, res) => {
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
app.get('/api/movies/upcoming/movies', async (req, res) => {
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
app.get('/api/movies/upcoming/series', async (req, res) => {
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

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
