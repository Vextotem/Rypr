const express = require('express');
const axios = require('axios');

const router = express.Router();

// Centralized error handler
const handleError = (res, error) => {
    console.error('Error details:', error);
    if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Status:', error.response.status);
    } else {
        console.error('Error message:', error.message);
    }
    res.status(500).json({ error: 'Failed to fetch data from TMDB' });
};

// TMDB API Base URL and default params
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY || '';
const LANGUAGE = 'en-US'; // Default language

// Helper function to construct image URLs safely
const getImageUrl = (path) => (path ? `https://image.tmdb.org/t/p/w500${path}` : null);

// Reusable axios configuration
const tmdbApiConfig = {
    params: {
        api_key: API_KEY,
        language: LANGUAGE,
    },
};

// Helper function for pagination
const paginateResults = (items, page = 1, perPage = 10) => {
    const offset = (page - 1) * perPage;
    return items.slice(offset, offset + perPage);
};

// GET trending movies this week with pagination
router.get('/trending/movies/week', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, tmdbApiConfig);

        // Paginate results
        const movies = paginateResults(response.data.results.map((movie) => ({
            ...movie,
            poster_path: getImageUrl(movie.poster_path),
        })), page, perPage);

        res.json({ ...response.data, results: movies, page });
    } catch (error) {
        handleError(res, error);
    }
});

// GET trending series this week with pagination
router.get('/trending/series/week', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/tv/week`, tmdbApiConfig);

        const series = paginateResults(response.data.results.map((tv) => ({
            ...tv,
            poster_path: getImageUrl(tv.poster_path),
        })), page, perPage);

        res.json({ ...response.data, results: series, page });
    } catch (error) {
        handleError(res, error);
    }
});

// GET popular movies with pagination
router.get('/popular/movies', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            ...tmdbApiConfig,
            params: {
                ...tmdbApiConfig.params,
                page,
            },
        });

        const movies = paginateResults(response.data.results.map((movie) => ({
            ...movie,
            poster_path: getImageUrl(movie.poster_path),
        })), page, perPage);

        res.json({ ...response.data, results: movies, page });
    } catch (error) {
        handleError(res, error);
    }
});

// GET popular series with pagination
router.get('/popular/series', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    try {
        const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
            ...tmdbApiConfig,
            params: {
                ...tmdbApiConfig.params,
                page,
            },
        });

        const series = paginateResults(response.data.results.map((tv) => ({
            ...tv,
            poster_path: getImageUrl(tv.poster_path),
        })), page, perPage);

        res.json({ ...response.data, results: series, page });
    } catch (error) {
        handleError(res, error);
    }
});

// GET movie trailers
router.get('/movies/:id/videos', async (req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}/videos`, tmdbApiConfig);

        res.json(response.data);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
