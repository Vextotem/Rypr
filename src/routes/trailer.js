const express = require('express');
const axios = require('axios');
const Redis = require('ioredis');
const router = express.Router();

// Initialize Redis client (Replace with your Upstash Redis URL)
const redis = new Redis("rediss://default:AZuUAAIjcDE0MmJhNzJjZjJmYmU0M2U1YjVlMmI4NTI0OTQxNDQ4MHAxMA@frank-oryx-39828.upstash.io:6379");

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

    // Generate a unique cache key
    const cacheKey = `trailer:${type}:${id}`;

    try {
        // Check if data is in cache
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData)); // Return cached response
        }

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
            const trailerData = {
                success: true,
                mediaType: type,
                trailerUrl: `https://www.youtube.com/watch?v=${trailer.key}`
            };

            // Store in Redis cache for 1 hour (3600 seconds)
            await redis.set(cacheKey, JSON.stringify(trailerData), 'EX', 3600);

            return res.json(trailerData);
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
