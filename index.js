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
    return '주말에는 신청을 받지 않습니다.';
  }

  // Check if the maximum limit of 10 requests per day has been reached
  if (requestedSongs.length >= 10) {
    return '오늘 신청이 마감되었습니다. (10개)';
  }

  // Check if the same singer is already requested
  if (requestedSongs.some(song => song.singer.toUpperCase() === singer.toUpperCase())) {
    return '동일한 가수의 신청곡이 존재합니다.';
  }

  // Check if the same song is already requested
  if (requestedSongs.some(song => song.songTitle === songTitle)) {
    return '동일한 신청곡이 존재합니다.';
  }

  // Check if the name or student number is in the blacklist
  if (blacklist.some(item => item.name === name || item.studentNumber === studentNumber)) {
    return '블랙리스트에 등록되신 것 같습니다. 최근 신청 시 주의사항을 위반한 적이 있는지 확인해주세요';
  }

  // Check if the same person has already made a request
  if (requestedSongs.some(song => song.name === name && song.studentNumber === studentNumber)) {
    return '이미 신청하셨습니다.';
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

    res.status(200).send('노래가 성공적으로 신청되었습니다!');
  }
});

app.get('/', (req, res) => {
  res.send(
    `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Song Request Backend</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
        }
        h1 {
          margin-bottom: 20px;
        }
        p {
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to the Song Request Backend</h1>
      <p>
        This backend server allows you to make song requests and view the requested songs.
      </p>
      <p>
        To make a song request, send a POST request to the <code>/song-request</code> endpoint with the following JSON payload:
        <br>
        <pre>
          {
            "name": "Your Name",
            "studentNumber": "Your Student Number",
            "songTitle": "Song Title",
            "singer": "Singer/Band Name"
          }</pre>
      </p>
      <p>
        To view the requested songs, send a GET request to the <code>/view-request</code> endpoint.
      </p>
    </body>
    </html>    
    `
  );
})

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
