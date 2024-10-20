const express = require('express');
const axios = require('axios');
const helmet = require('helmet'); // Import Helmet for security

const router = express.Router();

// Use Helmet middleware for added security
router.use(helmet());

// Middleware to handle errors
const handleError = (res, error) => {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
};

// TMDB API URL
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

// Function to get full image URL
const getImageUrl = (path) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : null; // Adjust size as needed
};

// Function to get video URL
const getTrailerUrl = (videos) => {
    const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null; // Return YouTube trailer URL
};

// Function to fetch trending movies and series
const fetchTrending = async (type) => {
    const endpoint = type === 'movies' ? 'trending/movie/week' : 'trending/tv/week';
    const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, {
        params: {
            api_key: process.env.TMDB_API_KEY,
        },
    });

    return await Promise.all(response.data.results.map(async item => {
        const videoResponse = await axios.get(`${TMDB_BASE_URL}/${type === 'movies' ? 'movie' : 'tv'}/${item.id}/videos`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
            },
        });
        const trailerUrl = getTrailerUrl(videoResponse.data.results);
        return {
            id: item.id,
            title: item.title || item.name,
            poster_path: getImageUrl(item.poster_path),
            trailer: trailerUrl,
            type: type,
        };
    }));
};

// GET trending movies or series
router.get('/:type', async (req, res) => {
    const { type } = req.params;

    if (type !== 'movies' && type !== 'series') {
        return res.status(400).json({ success: false, error: 'Invalid type' });
    }

    try {
        const collections = await fetchTrending(type);
        const hero = collections.length > 0 ? collections[0] : null; // Example hero, modify as needed
        const data = {
            collections: [{ title: 'Trending', items: collections }], // Wrap collections in an array
            hero: hero,
        };
        res.json({ success: true, data });
    } catch (error) {
        handleError(res, error);
    }
});

// Search for movies and series
router.get('/search', async (req, res) => {
    const { query, type } = req.query; // Expecting query and type (movie/tv)
    if (!query || !type) {
        return res.status(400).json({ success: false, error: 'Query and type are required' });
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

        const results = await Promise.all(response.data.results.map(async item => {
            const videoResponse = await axios.get(`${TMDB_BASE_URL}/${type}/${item.id}/videos`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                },
            });
            const trailerUrl = getTrailerUrl(videoResponse.data.results);
            return {
                id: item.id,
                title: item.title || item.name,
                poster_path: getImageUrl(item.poster_path),
                trailer: trailerUrl,
                type: type,
            };
        }));

        res.json({ success: true, data: results }); // Match frontend structure
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
