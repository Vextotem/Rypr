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
    const cacheKey = `trailer:tv:${id}`;

    try {
        // Check if data is in cache
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData)); // Return cached response
        }

        // Fetch video information from TMDB for TV show
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${id}/videos`, {
            params: {
                api_key: apiKey,
                language: 'en-US'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36'
            }
        });

        // Sort videos to prioritize newer ones
        const sortedVideos = response.data.results.sort((a, b) => {
            // If published_at exists, use it for sorting (newest first)
            if (a.published_at && b.published_at) {
                return new Date(b.published_at) - new Date(a.published_at);
            }
            return 0;
        });

        // Priority order for video selection
        let video = null;

        // 1. First priority: Official YouTube Trailer
        video = sortedVideos.find(v => 
            v.type === 'Trailer' && v.site === 'YouTube' && v.official === true
        );

        // 2. Second priority: Any YouTube Trailer
        if (!video) {
            video = sortedVideos.find(v => 
                v.type === 'Trailer' && v.site === 'YouTube'
            );
        }

        // 3. Third priority: YouTube Teaser
        if (!video) {
            video = sortedVideos.find(v => 
                v.type === 'Teaser' && v.site === 'YouTube'
            );
        }

        // 4. Fourth priority: Any YouTube video
        if (!video && sortedVideos.length > 0) {
            video = sortedVideos.find(v => v.site === 'YouTube');
        }

        // 5. Fifth priority: Any Vimeo video (as a fallback from YouTube)
        if (!video) {
            video = sortedVideos.find(v => v.site === 'Vimeo');
        }

        if (video) {
            let trailerUrl;
            
            // Create appropriate embed URL based on video provider
            if (video.site === 'YouTube') {
                // Use privacy-enhanced embed URL with additional parameters
                trailerUrl = `https://www.youtube-nocookie.com/embed/${video.key}?rel=0&modestbranding=1`;
            } else if (video.site === 'Vimeo') {
                trailerUrl = `https://player.vimeo.com/video/${video.key}`;
            } else {
                trailerUrl = `https://www.youtube-nocookie.com/embed/${video.key}`;
            }

            const videoData = {
                success: true,
                mediaType: 'tv',
                videoType: video.type,
                videoName: video.name,
                trailerUrl,
                isOfficial: video.official || false,
                site: video.site,
                publishedAt: video.published_at || null
            };

            // Store in Redis cache for 1 day (86400 seconds)
            await redis.set(cacheKey, JSON.stringify(videoData), 'EX', 86400);

            return res.json(videoData);
        } else {
            // No videos found
            const noVideoData = {
                success: false,
                mediaType: 'tv',
                error: 'No videos found for this TV show.'
            };
            
            // Cache the "no video" result too, but for a shorter time (1 hour)
            await redis.set(cacheKey, JSON.stringify(noVideoData), 'EX', 3600);
            
            return res.status(404).json(noVideoData);
        }
    } catch (error) {
        console.error(`Error fetching TV show trailer:`, error);
        res.status(500).json({
            success: false,
            error: 'Error fetching video for TV show from TMDB.',
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;
