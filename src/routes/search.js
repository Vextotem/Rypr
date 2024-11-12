// search.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper function to construct image URL
const getImageUrl = (path) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
};

// Helper function to get trailer URL from videos
const getTrailerUrl = (videos) => {
    const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
};

// Function to perform search on TMDB
const searchTMDB = async (query, type) => {
    const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/${type}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: query,
                language: 'en-US',
                page: 1,
            },
        });

        return await Promise.all(response.data.results.map(async item => {
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
    } catch (error) {
        throw new Error('Error searching TMDB');
    }
};

// Define the /search route
router.get('/search', async (req, res) => {
    const { query, type } = req.query; // Expecting query and type (movie/tv)
    if (!query || !type) {
        return res.status(400).json({ success: false, error: 'Query and type are required' });
    }

    try {
        const results = await searchTMDB(query, type);
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
