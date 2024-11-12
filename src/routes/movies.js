// movie.js
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

// Function to fetch movie details by ID
const fetchMovieById = async (id) => {
    const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
            },
        });

        const videoResponse = await axios.get(`${TMDB_BASE_URL}/movie/${id}/videos`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
            },
        });

        const trailerUrl = getTrailerUrl(videoResponse.data.results);

        return {
            id: response.data.id,
            title: response.data.title,
            overview: response.data.overview,
            poster_path: getImageUrl(response.data.poster_path),
            trailer: trailerUrl,
        };
    } catch (error) {
        throw new Error('Error fetching movie details from TMDB');
    }
};

// Define the /movie/:id route
router.get('/movie/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const movie = await fetchMovieById(id);
        res.json({ success: true, data: movie });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
