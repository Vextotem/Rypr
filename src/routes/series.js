// series.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper function to get image URL
const getImageUrl = (path) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
};

// Helper function to get trailer URL from videos
const getTrailerUrl = (videos) => {
    const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
};

// Helper function to fetch popular TV series
const fetchSeries = async () => {
    const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/discover/tv`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                sort_by: 'popularity.desc',
                page: 1,
            },
        });
        
        return await Promise.all(response.data.results.map(async item => {
            const videoResponse = await axios.get(`${TMDB_BASE_URL}/tv/${item.id}/videos`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                },
            });
            const trailerUrl = getTrailerUrl(videoResponse.data.results);
            return {
                id: item.id,
                name: item.name,
                poster_path: getImageUrl(item.poster_path),
                trailer: trailerUrl,
            };
        }));
    } catch (error) {
        throw new Error('Error fetching series from TMDB');
    }
};

// Define the /series route
router.get('/series', async (req, res) => {
    try {
        const series = await fetchSeries();
        res.json({
            success: true,
            data: {
                series: series,  // Return the series data
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
