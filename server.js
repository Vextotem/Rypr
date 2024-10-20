const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all requests
app.use(cors());

// Example endpoint to get movie details from TMDB
app.get('/api/movie/:id', async (req, res) => {
    const movieId = req.params.id;
        const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`;

            try {
                    const response = await axios.get(url);
                            res.json(response.data);
                                } catch (error) {
                                        console.error(error);
                                                res.status(500).send('Error fetching data from TMDB');
                                                    }
                                                    });

                                                    // Start the server
                                                    app.listen(PORT, () => {
                                                        console.log(`Server is running on http://localhost:${PORT}`);
                                                        });