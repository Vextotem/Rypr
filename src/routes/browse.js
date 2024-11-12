// src/routes/browse.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Use your environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// Function to fetch movies from TMDB based on the category
const fetchMovies = async (category) => {
    try {
        let endpoint;

        // Set the endpoint based on the category
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

// Function to fetch series from TMDB based on the category
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

// Browse endpoint to fetch both movies and series categories (Trending, Popular, Top Rated, Upcoming, On the Air)
router.get('/', async (req, res) => {
    try {
        // Fetch data for movies
        const trendingMovies = await fetchMovies('trending');
        const popularMovies = await fetchMovies('popular');
        const topRatedMovies = await fetchMovies('top_rated');
        const upcomingMovies = await fetchMovies('upcoming');

        // Fetch data for series
        const trendingSeries = await fetchSeries('trending');
        const popularSeries = await fetchSeries('popular');
        const topRatedSeries = await fetchSeries('top_rated');
        const onTheAirSeries = await fetchSeries('on_the_air');

        // Return the data for both movies and series
        res.json({
            success: true,
            data: {
                movies: {
                    trending: trendingMovies,
                    popular: popularMovies,
                    top_rated: topRatedMovies,
                    upcoming: upcomingMovies,
                },
                series: {
                    trending: trendingSeries,
                    popular: popularSeries,
                    top_rated: topRatedSeries,
                    on_the_air: onTheAirSeries,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch data' });
    }
});

module.exports = router;
