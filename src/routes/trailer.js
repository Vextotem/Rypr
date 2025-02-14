const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/:id', async (req, res) => {
    const movieId = req.params.id;
    const apiKey = process.env.TMDB_API_KEY; // Ensure this is set in your .env file
    
    try {
        // Make a request to the TMDB API to get the video (trailer) information
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
            params: {
                api_key: apiKey,
                language: 'en-US'
            }
        });

        // Find the trailer from the results
        const trailer = response.data.results.find(video => video.type === 'Trailer');
        
        if (trailer) {
            // Return the trailer URL (YouTube link)
            res.json({
                success: true,
                trailerUrl: `https://www.youtube.com/watch?v=${trailer.key}`
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Trailer not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching trailer from TMDB'
        });
    }
});

module.exports = router;
