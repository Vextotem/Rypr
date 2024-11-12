// src/routes/series.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Use your environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// Function to get TV series data from TMDB based on the type
const fetchSeries = async (category) => {
    try {
        let endpoint;

        // Set the endpoint based on category
        switch (category) {
            case 'trending':
                endpoint = '/trending/tv/week';
                break;
            case 'popular':
                endpoint = '/tv/popular';
                break;
            case 'top_rated':
                endpoint = '/tv/top_rated';
                break;
            case 'on_the_air':
                endpoint = '/tv/on_the_air';
                break;
            default:
                throw new Error('Invalid category');
        }

        // Fetch data from TMDB
        const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
                page: 1, // Modify page number if needed
            }
        });

        // Process the response to format the series data
        return response.data.results.map(series => ({
            id: series.id,
            title: series.name,
            overview: series.overview,
            first_air_date: series.first_air_date,
            poster_path: `https://image.tmdb.org/t/p/w500${series.poster_path}`,
        }));
    } catch (error) {
        console.error('Error fetching data from TMDB:', error.message);
        throw error; // Rethrow error to handle it in the route
    }
};

// Series endpoint to fetch all series categories (Trending, Popular, Top Rated, On The Air)
router.get('/', async (req, res) => {
    try {
        // Fetch data for each category
        const trendingSeries = await fetchSeries('trending');
        const popularSeries = await fetchSeries('popular');
        const topRatedSeries = await fetchSeries('top_rated');
        const onTheAirSeries = await fetchSeries('on_the_air');

        // Return the series data for each category in the response
        res.json({
            success: true,
            data: {
                trending: trendingSeries,
                popular: popularSeries,
                top_rated: topRatedSeries,
                on_the_air: onTheAirSeries,
            },
        });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch series' });
    }
});

module.exports = router;
