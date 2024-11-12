// src/routes/movies.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Use your environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// Function to get movie data from TMDB based on the type
const fetchMovies = async (category) => {
    try {
        let endpoint;

        // Set the endpoint based on category
        switch (category) {
            case 'trending':
                endpoint = '/trending/movie/week';
                break;
            case 'popular':
                endpoint = '/movie/popular';
                break;
            case 'top_rated':
                endpoint = '/movie/top_rated';
                break;
            case 'upcoming':
                endpoint = '/movie/upcoming';
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

        // Process the response to format the movie data
        return response.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }));
    } catch (error) {
        console.error('Error fetching data from TMDB:', error.message);
        throw error; // Rethrow error to handle it in the route
    }
};

// Browse endpoint to fetch all movie categories (Trending, Popular, Top Rated, Upcoming)
router.get('/browse', async (req, res) => {
    try {
        // Fetch data for each category
        const trendingMovies = await fetchMovies('trending');
        const popularMovies = await fetchMovies('popular');
        const topRatedMovies = await fetchMovies('top_rated');
        const upcomingMovies = await fetchMovies('upcoming');

        // Return the movie data for each category in the response
        res.json({
            success: true,
            data: {
                trending: trendingMovies,
                popular: popularMovies,
                top_rated: topRatedMovies,
                upcoming: upcomingMovies,
            },
        });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch movies' });
    }
});

module.exports = router;
