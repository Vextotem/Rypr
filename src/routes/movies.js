const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const apiKey = process.env.TMDB_API_KEY; // Ensure this is set in your .env file

    try {
        // Fetch video (trailer) information from TMDB for movie
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}/videos`, {
            params: {
                api_key: apiKey,
                language: 'en-US'
            }
        });

        // Find the first trailer (prioritizing "Official" trailers)
        const trailer = response.data.results.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        );

        if (trailer) {
            res.json({
                success: true,
                mediaType: 'movie',
                trailerUrl: `https://www.youtube.com/watch?v=${trailer.key}`
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'No trailer found for this movie.'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching trailer for movie from TMDB.',
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;
