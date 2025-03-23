const express = require('express');
const axios = require('axios');
const Redis = require('ioredis');
const router = express.Router();

// Initialize Redis client (Replace with your Upstash Redis URL)
const redis = new Redis("rediss://default:AZuUAAIjcDE0MmJhNzJjZjJmYmU0M2U1YjVlMmI4NTI0OTQxNDQ4MHAxMA@frank-oryx-39828.upstash.io:6379");

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const apiKey = process.env.TMDB_API_KEY; // Ensure this is set in your .env file

    // Generate a unique cache key  
    const cacheKey = `trailer:tv:${id}`;  

    try {  
        // Check if data is in cache  
        const cachedData = await redis.get(cacheKey);  
        if (cachedData) {  
            return res.json(JSON.parse(cachedData)); // Return cached response  
        }  

        // Fetch video (trailer) information from TMDB for TV show  
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${id}/videos`, {  
            params: {  
                api_key: apiKey,  
                language: 'en-US'  
            }  
        });  

        // Try to find the first trailer (prioritizing "Official" trailers)  
        let video = response.data.results.find(video =>  
            video.type === 'Trailer' && video.site === 'YouTube'  
        );

        // If no trailer, fallback to any available video
        if (!video && response.data.results.length > 0) {
            video = response.data.results[0]; // Fallback to the first available video
        }

        if (video) {
            const videoData = {
                success: true,
                mediaType: 'tv',
                videoUrl: `https://www.youtube.com/watch?v=${video.key}`,
                videoType: video.type || 'Video', // Adding type in case it's not a trailer
            };

            // Store in Redis cache for 1 hour (3600 seconds)
            await redis.set(cacheKey, JSON.stringify(videoData), 'EX', 3600);

            return res.json(videoData);
        } else {
            res.status(404).json({
                success: false,
                error: 'No videos found for this TV show.'
            });
        }
    } catch (error) {  
        res.status(500).json({  
            success: false,  
            error: 'Error fetching video for TV show from TMDB.',  
            details: error.response?.data || error.message  
        });  
    }  
});

module.exports = router;
