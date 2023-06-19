// Import the modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Middleware to parse JSON data
app.use(bodyParser.json());

// Object to store requested songs by date
const requestedSongsByDate = {};

// Array to store the blacklist
const blacklist = [];

// Function to check if a song request is valid
function isRequestValid(name, studentNumber, songTitle, singer) {
  const currentDate = new Date();
  const currentDateString = currentDate.toDateString();

  // Reset requests each day
  if (!requestedSongsByDate[currentDateString]) {
    requestedSongsByDate[currentDateString] = [];
  }

  const requestedSongs = requestedSongsByDate[currentDateString];

  // Check if it's a weekend (Saturday or Sunday)
  const dayOfWeek = currentDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'Song requests are not accepted on weekends.';
  }

  // Check if the maximum limit of 10 requests per day has been reached
  if (requestedSongs.length >= 10) {
    return 'Maximum limit of song requests per day reached.';
  }

  // Check if the same singer is already requested
  if (requestedSongs.some(song => song.singer.toUpperCase() === singer.toUpperCase())) {
    return 'Song request for the same singer already exists.';
  }

  // Check if the same song is already requested
  if (requestedSongs.some(song => song.songTitle === songTitle)) {
    return 'Song request for the same song already exists.';
  }

  // Check if the name or student number is in the blacklist
  if (blacklist.some(item => item.name === name || item.studentNumber === studentNumber)) {
    return 'You are not allowed to make a song request.';
  }

  // Check if the same person has already made a request
  if (requestedSongs.some(song => song.name === name && song.studentNumber === studentNumber)) {
    return 'You have already made a song request.';
  }

  return ''; // Request is valid
}


// Function 1: Receive song requests
app.post('/song-request', (req, res) => {
  const { name, studentNumber, songTitle, singer } = req.body;

  const requestValidity = isRequestValid(name, studentNumber, songTitle, singer);

  if (requestValidity) {
    res.status(400).json({ error: requestValidity });
  } else {
    const currentDate = new Date();
    const currentDateString = currentDate.toDateString();

    // Reset requests each day
    if (!requestedSongsByDate[currentDateString]) {
      requestedSongsByDate[currentDateString] = [];
    }

    const requestedSongs = requestedSongsByDate[currentDateString];

    // Add the requested song to the array for the current date
    requestedSongs.push({ name, studentNumber, songTitle, singer });

    res.status(200).send('Song request received successfully!');
  }
});

// Function 2: Send requested songs as JSON
app.get('/view-request', (req, res) => {
  const currentDate = new Date();
  const currentDateString = currentDate.toDateString();

  // Retrieve the requested songs for the current date
  const requestedSongs = requestedSongsByDate[currentDateString] || [];

  res.json(requestedSongs);
});

app.get('/view-all-requests', (req, res) => {
  res.json(requestedSongsByDate);
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
