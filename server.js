const express = require('express');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');
const { exec } = require('child_process');  // To run commands like launching apps
const https = require('https');  // Added https import

dotenv.config();

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route for homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle support queries
app.post('/support', async (req, res) => {
    const userQuery = req.body.query;
    try {
        const response = await axios.post('https://api.jemini.ai/support', {
            query: userQuery
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.AIzaSyAT5Hd0EDwovShsEjvHkJiZKjM4iBbS6zo}` // Ensure API key is set properly
            }
        });
        
        res.json({ answer: response.data.answer });
    } catch (error) {
        console.error('Error fetching support from Jemini:', error);
        res.status(500).json({ answer: 'Error fetching support.' });
    }
});

// Route to fetch weather (using Weather API)
app.get('/weather', (req, res) => {
    const city = req.query.city || 'Dhule';  // Default city

    const options = {
        method: 'GET',
        hostname: 'weatherapi-com.p.rapidapi.com',
        path: `/current.json?q=${encodeURIComponent(city)}`,  // Dynamic city
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,  // Correct key
            'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
        }
    };

    const weatherReq = https.request(options, (weatherRes) => {
        let chunks = [];

        weatherRes.on('data', (chunk) => {
            chunks.push(chunk);
        });

        weatherRes.on('end', () => {
            try {
                const body = Buffer.concat(chunks).toString();
                res.json(JSON.parse(body));
            } catch (error) {
                res.status(500).json({ error: 'Failed to parse weather information' });
            }
        });
    });

    weatherReq.on('error', (e) => {
        console.error(`Error fetching weather data: ${e.message}`);
        res.status(500).json({ error: 'Failed to fetch weather information' });
    });

    weatherReq.end();
});

// Route to open apps on Windows
app.post('/open-app', (req, res) => {
    const appName = req.body.appName;
    exec(appName, (err) => {
        if (err) {
            console.error(`Error opening ${appName}:`, err);
            return res.status(500).json({ error: `Failed to open ${appName}` });
        }
        res.json({ message: `${appName} opened successfully` });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
