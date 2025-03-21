const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const apiKey = process.env.TMDB_API_KEY; // Ensure this is set in your .env file

    // Validate media type
    if (!['movie', 'tv'].includes(type)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid media type. Must be "movie" or "tv".'
        });
    }

    try {
        // Fetch video (trailer) information from TMDB
        const response = await axios.get(`https://api.themoviedb.org/3/${type}/${id}/videos`, {
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
                mediaType: type,
                trailerUrl: `https://www.youtube.com/watch?v=${trailer.key}`
            });
        } else {
            res.status(404).json({
                success: false,
                error: `No trailer found for this ${type}.`
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: `Error fetching trailer for ${type} from TMDB.`,
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;
