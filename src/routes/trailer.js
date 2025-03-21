const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route to get trailers for both movies and TV shows
router.get('/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const apiKey = process.env.TMDB_API_KEY; // Ensure this is set in your .env file
    
    // Validate media type
    if (type !== 'movie' && type !== 'tv') {
        return res.status(400).json({
            success: false,
            error: 'Invalid media type. Must be "movie" or "tv"'
        });
    }
    
    try {
        // Make a request to the TMDB API to get the video (trailer) information
        // The endpoint is different for movies vs TV shows
        const response = await axios.get(`https://api.themoviedb.org/3/${type}/${id}/videos`, {
            params: {
                api_key: apiKey,
                language: 'en-US'
            }
        });

        // Find the trailer from the results
        // For TV shows, we might want to prioritize Season trailers over Episode trailers
        const trailers = response.data.results.filter(video => 
            video.type === 'Trailer' && 
            (video.site === 'YouTube' || video.site === 'Vimeo')
        );
        
        if (trailers.length > 0) {
            // Return the first trailer URL, or you could return all of them
            const trailer = trailers[0];
            const videoUrl = trailer.site === 'YouTube' 
                ? `https://www.youtube.com/watch?v=${trailer.key}`
                : `https://vimeo.com/${trailer.key}`;
                
            res.json({
                success: true,
                mediaType: type,
                trailerUrl: videoUrl,
                allTrailers: trailers.map(t => ({
                    name: t.name,
                    site: t.site,
                    url: t.site === 'YouTube' 
                        ? `https://www.youtube.com/watch?v=${t.key}`
                        : `https://vimeo.com/${t.key}`
                }))
            });
        } else {
            res.status(404).json({
                success: false,
                error: `No trailers found for this ${type}`
            });
        }
    } catch (error) {
        console.error('TMDB API Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: `Error fetching trailer for ${type} from TMDB`,
            details: error.response?.data || error.message
        });
    }
});

// Backward compatibility for the original route structure
router.get('/:id', async (req, res) => {
    const movieId = req.params.id;
    // Redirect to the new route structure
    return res.redirect(`/api/trailers/movie/${movieId}`);
});

module.exports = router;
