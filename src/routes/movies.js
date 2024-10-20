const express = require('express');
const axios = require('axios');
const helmet = require('helmet');

const router = express.Router();
router.use(helmet());

const handleError = (res, error) => {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
};

const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

const getImageUrl = (path) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
};

const getTrailerUrl = (videos) => {
    const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
};

// Get movie or series details by ID
router.get('/:type/:id', async (req, res) => {
    const { type, id } = req.params;

    try {
        const response = await axios.get(`${TMDB_BASE_URL}/${type}/${id}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                append_to_response: 'videos',
            },
        });

        const mediaData = response.data;
        const trailerUrl = getTrailerUrl(mediaData.videos.results);

        const result = {
            id: mediaData.id,
            title: mediaData.title || mediaData.name,
            images: {
                poster: getImageUrl(mediaData.poster_path),
                backdrop: getImageUrl(mediaData.backdrop_path),
                logo: getImageUrl(mediaData.logo_path),
            },
            description: mediaData.overview,
            rating: mediaData.vote_average * 10, // Convert to percentage
            date: mediaData.release_date || mediaData.first_air_date,
            genres: mediaData.genres,
            trailer: trailerUrl,
            seasons: mediaData.number_of_seasons || 0,
            suggested: [], // You can populate this later if needed
            tagline: mediaData.tagline || '',
            runtime: mediaData.runtime || mediaData.episode_run_time[0] || 0,
        };

        res.json({ success: true, data: result });
    } catch (error) {
        handleError(res, error);
    }
});

// Get episodes for a given series ID and season
router.get('/episodes/:id', async (req, res) => {
    const { id } = req.params;
    const { s: season } = req.query;

    try {
        const response = await axios.get(`${TMDB_BASE_URL}/tv/${id}/season/${season}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
            },
        });

        const episodes = response.data.episodes.map(episode => ({
            id: episode.id,
            title: episode.name,
            air_date: episode.air_date,
            overview: episode.overview,
            season_number: episode.season_number,
            episode_number: episode.episode_number,
            still_path: getImageUrl(episode.still_path),
        }));

        res.json({ success: true, data: episodes });
    } catch (error) {
        handleError(res, error);
    }
});

// Search for movies and series
router.get('/search', async (req, res) => {
    const { query, type } = req.query;
    if (!query || !type) {
        return res.status(400).json({ success: false, error: 'Query and type are required' });
    }

    try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/${type}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: query,
                language: 'en-US',
                page: 1,
            },
        });

        const results = await Promise.all(response.data.results.map(async item => {
            const videoResponse = await axios.get(`${TMDB_BASE_URL}/${type}/${item.id}/videos`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                },
            });
            const trailerUrl = getTrailerUrl(videoResponse.data.results);
            return {
                id: item.id,
                title: item.title || item.name,
                poster_path: getImageUrl(item.poster_path),
                trailer: trailerUrl,
                type: type,
            };
        }));

        res.json({ success: true, data: results });
    } catch (error) {
        handleError(res, error);
    }
});

// Additional routes for trending movies and series can remain unchanged...

module.exports = router;
