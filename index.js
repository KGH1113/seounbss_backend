// Import the modules
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Middleware to parse JSON data
app.use(bodyParser.json());

const requestedSongsByDate = {};
let requestedSuggestions = [];

const blacklist = [];
const suggestion_blacklist = [];

// Function to check if a song request is valid
const isRequestValid = (name, studentNumber, songTitle, singer) => {
  const currentDateString = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Reset requests each day
  if (!requestedSongsByDate[currentDateString]) {
    requestedSongsByDate[currentDateString] = [];
  }

  const requestedSongs = requestedSongsByDate[currentDateString];

  // Check if it's a weekend (Saturday or Sunday)
  if (currentDateString.split(', ')[0] === 'Sat' || currentDateString.split(', ')[0] === 'Sun') {
    return "주말에는 신청을 받지 않습니다.";
  }

  // Check if the maximum limit of 10 requests per day has been reached
  if (requestedSongs.length >= 10) {
    return "오늘 신청이 마감되었습니다. (10개)";
  }

  // Check if the same singer is already requested
  if (
    requestedSongs.some(
      (song) => song.singer.toUpperCase() === singer.toUpperCase()
    )
  ) {
    return "동일한 가수의 신청곡이 존재합니다.";
  }

  // Check if the same song is already requested
  if (requestedSongs.some((song) => song.songTitle === songTitle)) {
    return "동일한 신청곡이 존재합니다.";
  }

  // Check if the name or student number is in the blacklist
  if (
    blacklist.some(
      (item) => item.name === name || item.studentNumber === studentNumber
    )
  ) {
    return "블랙리스트에 등록되신 것 같습니다. 최근 신청 시 주의사항을 위반한 적이 있는지 확인해주세요";
  }

  // Check if the same person has already made a request
  if (
    requestedSongs.some(
      (song) => song.name === name && song.studentNumber === studentNumber
    )
  ) {
    return "이미 신청하셨습니다.";
  }

  return ""; // Request is valid
};

// Function: Receive song requests
app.post("/song-request", (req, res) => {
  const { name, studentNumber, songTitle, singer } = req.body;

  const requestValidity = isRequestValid(
    name,
    studentNumber,
    songTitle,
    singer
  );

  if (requestValidity) {
    res.status(400).json({ error: requestValidity });
  } else {
    const currentDateString = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Seoul",
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Reset requests each day
    if (!requestedSongsByDate[currentDateString]) {
      requestedSongsByDate[currentDateString] = [];
    }

    const requestedSongs = requestedSongsByDate[currentDateString];

    // Add the requested song to the array for the current date
    requestedSongs.push({
      name,
      studentNumber,
      songTitle,
      singer,
      time: new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Seoul",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      }),
    });
    console.log(requestedSongsByDate);
    res.status(200).send("노래가 성공적으로 신청되었습니다!");
  }
});

app.post("/delete-song-request", (req, res) => {
  const { date, studentNumber } = req.body;
  requestedSongsByDate[date] = requestedSongsByDate[date].filter(
    (element, index) => element.studentNumber != studentNumber
  );
  if (requestedSongsByDate[date] == []) {
    delete requestedSongsByDate[date];
  }
  res.status(200).send("success");
});

app.get("/view-request", (req, res) => {
  const currentDateString = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Retrieve the requested songs for the current date
  const requestedSongs = requestedSongsByDate[currentDateString] || [];

  res.json(requestedSongs);
});

app.get("/view-all-requests", (req, res) => {
  res.json(requestedSongsByDate);
});

app.post("/suggestion-request", (req, res) => {
  const { name, studentNumber, suggestion } = req.body;
  if (
    suggestion_blacklist.some(
      (item) => item.name === name || item.studentNumber === studentNumber
    )
  ) {
    res.status(400).json({ error: "블랙리스트에 등록되신 것 같습니다." });
  } else {
    // Add the requested song to the array for the current date
    requestedSuggestions.push({ name, studentNumber, suggestion, answer: "" });

    res.status(200).send("방송부 건의사항이 성공적으로 신청되었습니다!");
  }
});

app.post("/delete-suggestion-request", (req, res) => {
  const { indexOfsuggestion } = req.body;
  console.log(indexOfsuggestion);
  requestedSuggestions.splice(indexOfsuggestion, 1);
  console.log(requestedSuggestions);
  res.status(200).send("success");
});

app.post("/answer-suggestion", (req, res) => {
  const { answer, indexOfsuggestion } = req.body;
  console.log(answer, indexOfsuggestion);
  requestedSuggestions[indexOfsuggestion].answer = answer;
  res.status(200).send("success");
});

app.get("/view-suggestion", (req, res) => {
  res.json(requestedSuggestions);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
