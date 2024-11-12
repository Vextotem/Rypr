// episodes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper function to construct image URL
const getImageUrl = (path) => path ? `https://image.tmdb.org/t/p/w500${path}` : null;

// Function to fetch episodes by series ID and season number
const fetchEpisodesBySeason = async (id, seasonNumber) => {
    const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
            },
        });
        return response.data.episodes.map(episode => ({
            id: episode.id,
            name: episode.name,
            overview: episode.overview,
            episode_number: episode.episode_number,
            air_date: episode.air_date,
            still_path: getImageUrl(episode.still_path),
        }));
    } catch (error) {
        throw new Error('Error fetching episodes from TMDB');
    }
};

// Define the /episodes/:id route with a season query parameter
router.get('/episodes/:id', async (req, res) => {
    const { id } = req.params;
    const { s: seasonNumber } = req.query; // Season number is expected in query parameter 's'

    if (!seasonNumber) {
        return res.status(400).json({ success: false, error: 'Season number (s) is required' });
    }

    try {
        const episodes = await fetchEpisodesBySeason(id, seasonNumber);
        res.json({ success: true, data: episodes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
