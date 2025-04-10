const express = require('express');
const axios = require('axios');
const Redis = require('ioredis');
const router = express.Router();

// Initialize Redis client (Replace with your Upstash Redis URL)
const redis = new Redis("rediss://default:AZuUAAIjcDE0MmJhNzJjZjJmYmU0M2U1YjVlMmI4NTI0OTQxNDQ4MHAxMA@frank-oryx-39828.upstash.io:6379");

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const apiKey = process.env.TMDB_API_KEY; // Ensure this is set in your .env file

    // Check if the API key is missing
    if (!apiKey) {
        return res.status(500).json({ success: false, error: 'TMDB API key not set' });
    }

    // Generate a unique cache key
    const cacheKey = `trailer:movie:${id}`;

    try {
        // Check if data is in cache
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData)); // Return cached response
        }

        // Fetch video information from TMDB for movie
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}/videos`, {
            params: {
                api_key: apiKey,
                language: 'en-US'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36'
            }
        });

        // First try to find an official trailer
        let video = response.data.results.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube' && video.official === true
        );

        // If no official trailer, try any trailer
        if (!video) {
            video = response.data.results.find(video => 
                video.type === 'Trailer' && video.site === 'YouTube'
            );
        }

        // If no trailer at all, fall back to any video (teaser, clip, etc.)
        if (!video && response.data.results.length > 0) {
            video = response.data.results.find(video => video.site === 'YouTube');
        }

        if (video) {
            const videoData = {
                success: true,
                mediaType: 'movie',
                videoType: video.type,
                videoName: video.name,
                trailerUrl: `https://www.youtube-nocookie.com/embed/${video.key}`, // Use embed URL
                isOfficial: video.official || false
            };

            // Store in Redis cache for 1 hour (3600 seconds)
            await redis.set(cacheKey, JSON.stringify(videoData), 'EX', 3600);

            return res.json(videoData);
        } else {
            res.status(404).json({
                success: false,
                error: 'No videos found for this movie.'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching video for movie from TMDB.',
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;
