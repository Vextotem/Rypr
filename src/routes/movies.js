const express = require('express');
const axios = require('axios');

const router = express.Router();

// Middleware to handle errors
const handleError = (res, error) => {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
};

// TMDB API URL
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

// Function to get full image URL
const getImageUrl = (path) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : null; // Adjust size as needed
};

// Function to get video URL
const getTrailerUrl = (videos) => {
    const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null; // Return YouTube trailer URL
};

// GET trending movies this week
router.get('/trending/movies/week', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
            },
        });

        // Map response to include thumbnail URLs and trailers
        const movies = await Promise.all(response.data.results.map(async movie => {
            const videoResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movie.id}/videos`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                },
            });
            const trailerUrl = getTrailerUrl(videoResponse.data.results);
            return {
                id: movie.id,
                title: movie.title,
                thumbnail: getImageUrl(movie.poster_path), // Add thumbnail URL
                trailer: trailerUrl, // Add trailer URL
            };
        }));

        res.json(movies);
    } catch (error) {
        handleError(res, error);
    }
});

// GET trending series this week
router.get('/trending/series/week', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/tv/week`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
            },
        });

        // Map response to include thumbnail URLs and trailers
        const series = await Promise.all(response.data.results.map(async tvShow => {
            const videoResponse = await axios.get(`${TMDB_BASE_URL}/tv/${tvShow.id}/videos`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                },
            });
            const trailerUrl = getTrailerUrl(videoResponse.data.results);
            return {
                id: tvShow.id,
                title: tvShow.name,
                thumbnail: getImageUrl(tvShow.poster_path), // Add thumbnail URL
                trailer: trailerUrl, // Add trailer URL
            };
        }));

        res.json(series);
    } catch (error) {
        handleError(res, error);
    }
});

// GET popular movies
router.get('/popular/movies', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: 1,
            },
        });

        // Map response to include thumbnail URLs and trailers
        const movies = await Promise.all(response.data.results.map(async movie => {
            const videoResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movie.id}/videos`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                },
            });
            const trailerUrl = getTrailerUrl(videoResponse.data.results);
            return {
                id: movie.id,
                title: movie.title,
                thumbnail: getImageUrl(movie.poster_path), // Add thumbnail URL
                trailer: trailerUrl, // Add trailer URL
            };
        }));

        res.json(movies);
    } catch (error) {
        handleError(res, error);
    }
});

// GET popular series
router.get('/popular/series', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: 1,
            },
        });

        // Map response to include thumbnail URLs and trailers
        const series = await Promise.all(response.data.results.map(async tvShow => {
            const videoResponse = await axios.get(`${TMDB_BASE_URL}/tv/${tvShow.id}/videos`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                },
            });
            const trailerUrl = getTrailerUrl(videoResponse.data.results);
            return {
                id: tvShow.id,
                title: tvShow.name,
                thumbnail: getImageUrl(tvShow.poster_path), // Add thumbnail URL
                trailer: trailerUrl, // Add trailer URL
            };
        }));

        res.json(series);
    } catch (error) {
        handleError(res, error);
    }
});

// Other routes remain unchanged...

// Search for movies and series
router.get('/search', async (req, res) => {
    const { query, type } = req.query; // Expecting query and type (movie/tv)
    if (!query || !type) {
        return res.status(400).json({ error: 'Query and type are required' });
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

        // Map response to include thumbnail URLs and trailers
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
                thumbnail: getImageUrl(item.poster_path), // Add thumbnail URL
                trailer: trailerUrl, // Add trailer URL
                type: type,
            };
        }));

        res.json(results);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
