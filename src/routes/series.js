// series.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper functions
const getImageUrl = (path) => path ? `https://image.tmdb.org/t/p/w500${path}` : null;
const getTrailerUrl = (videos) => {
    const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
};

// Function to fetch series details by ID
const fetchSeriesById = async (id) => {
    const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/tv/${id}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
            },
        });
        const videoResponse = await axios.get(`${TMDB_BASE_URL}/tv/${id}/videos`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
            },
        });
        const trailerUrl = getTrailerUrl(videoResponse.data.results);
        
        return {
            id: response.data.id,
            name: response.data.name,
            overview: response.data.overview,
            poster_path: getImageUrl(response.data.poster_path),
            trailer: trailerUrl,
            genres: response.data.genres.map(genre => genre.name),
            seasons: response.data.seasons,
        };
    } catch (error) {
        throw new Error('Error fetching series details from TMDB');
    }
};

// Define the /series/:id route
router.get('/series/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const series = await fetchSeriesById(id);
        res.json({ success: true, data: series });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
