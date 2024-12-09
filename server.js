const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Enable JSON parsing
app.use(bodyParser.json());

// Store GPS data in memory (replace with database in production)
let gpsData = [];

// Basic security middleware
const API_KEY = 'your-secret-api-key'; // Replace with your actual API key
const checkApiKey = (req, res, next) => {
    const apiKey = req.body.api_key;
    if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Simple HTML page to view data
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>GPS Tracker</title>
                <style>
                    body { font-family: Arial; margin: 20px; }
                    #map { height: 400px; width: 100%; }
                    #data { margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>GPS Tracker</h1>
                <div id="map"></div>
                <div id="data"></div>
                
                <script>
                    function initMap() {
                        const map = new google.maps.Map(document.getElementById('map'), {
                            zoom: 15
                        });
                        
                        function updateData() {
                            fetch('/latest-gps')
                                .then(response => response.json())
                                .then(data => {
                                    if (data.latitude && data.longitude) {
                                        const position = {
                                            lat: parseFloat(data.latitude),
                                            lng: parseFloat(data.longitude)
                                        };
                                        
                                        new google.maps.Marker({
                                            position: position,
                                            map: map
                                        });
                                        
                                        map.setCenter(position);
                                        
                                        document.getElementById('data').innerHTML = 
                                            '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                                    }
                                });
                        }
                        
                        // Update every 10 seconds
                        updateData();
                        setInterval(updateData, 10000);
                    }
                </script>
                <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap"
                    async defer></script>
            </body>
        </html>
    `);
});

// Endpoint to receive GPS data
app.post('/gps-data', checkApiKey, (req, res) => {
    const data = {
        timestamp: new Date(),
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        altitude: req.body.altitude,
        speed: req.body.speed,
        satellites: req.body.satellites
    };
    
    gpsData.push(data);
    console.log('Received GPS data:', data);
    res.json({ status: 'success', message: 'GPS data received' });
});

// Endpoint to get latest GPS data
app.get('/latest-gps', (req, res) => {
    const latest = gpsData[gpsData.length - 1];
    res.json(latest || { error: 'No GPS data available' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
