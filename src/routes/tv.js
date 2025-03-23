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
  const cacheKey = `video:tv:${id}`;  

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
      }  
    });  

    // Check if we have any videos
    if (response.data.results.length === 0) {
      return res.status(404).json({  
        success: false,  
        error: 'No videos found for this TV show.'  
      });
    }

    // First try to find an official trailer
    let video = response.data.results.find(video =>  
      video.type === 'Trailer' && 
      video.site === 'YouTube' && 
      video.name.toLowerCase().includes('official')
    );  

    // If no official trailer, try to find any trailer
    if (!video) {
      video = response.data.results.find(video =>  
        video.type === 'Trailer' && 
        video.site === 'YouTube'
      );
    }

    // If still no trailer, use the first available YouTube video of any type
    if (!video) {
      video = response.data.results.find(video => video.site === 'YouTube');
    }

    if (video) {  
      const videoData = {  
        success: true,  
        mediaType: 'tv',
        videoType: video.type,
        videoName: video.name,
        videoUrl: `https://www.youtube.com/watch?v=${video.key}`  
      };  

      // Store in Redis cache for 1 hour (3600 seconds)  
      await redis.set(cacheKey, JSON.stringify(videoData), 'EX', 3600);  

      return res.json(videoData);  
    } else {  
      // This would only happen if there are videos but none on YouTube
      res.status(404).json({  
        success: false,  
        error: 'No compatible videos found for this TV show.'  
      });  
    }  
  } catch (error) {  
    const errorMessage = error.response?.data?.status_message || error.message;
    const errorCode = error.response?.status || 500;
    
    res.status(errorCode).json({  
      success: false,  
      error: 'Error fetching videos for TV show from TMDB.',  
      details: errorMessage
    });  
  }
});

module.exports = router;
