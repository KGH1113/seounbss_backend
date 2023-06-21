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
const requestedSongsByDate = {"Mon Jun 19 2023":[{"name":"김지오","studentNumber":"10508","songTitle":"오랜 날 오랜 밤","singer":"악뮤"},{"name":"구태윤","studentNumber":"11202","songTitle":"이브,프시케 그리고 부른 수염의 아내","singer":"르세라핌"},{"name":"이서현","studentNumber":"11223","songTitle":"Good As It Gets","singer":"이서현"},{"name":"이승준","studentNumber":"20719","songTitle":"가로수 그늘 아래에 서면","singer":"이승준"},{"name":"정재용","studentNumber":"10529","songTitle":"uptown funk","singer":"Bruno Mars"},{"name":"김세원 ","studentNumber":"10205","songTitle":"Broken Melodies ","singer":"NCT DREAM"},{"name":"","studentNumber":"","songTitle":"","singer":""},{"name":"천주원","studentNumber":"10530","songTitle":"손오공","singer":"세븐틴"}],"Tue Jun 20 2023":[{"name":"구태윤","studentNumber":"11202","songTitle":"작은 것들을 위한 시","singer":"방탄"},{"name":"이세은","studentNumber":"11023","songTitle":"척","singer":"마마무"}]};

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
        div {
          padding: 10px;
          border-radius: 6px;
          width: 300px;
          background-color: #909090;
        }
        code {
          color: white;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to the Song Request Backend</h1>
      <p>
        This backend server allows you to make song requests and view the requested songs.
      </p>
      <p>To make a song request, send a POST request to the <div><code>/song-request</code></div> endpoint with the following JSON payload:</p><br>
      <div>
        <code>
          {<br>
            &emsp;"name": "Your Name",<br>
            &emsp;"studentNumber": "Your Student Number",<br>
            &emsp;"songTitle": "Song Title",<br>
            &emsp;"singer": "Singer/Band Name"<br>
          }
        </code>
      </div>
      <p>To view the requested songs, send a GET request to the <div><code>/view-request</code></div> endpoint.</p>
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
