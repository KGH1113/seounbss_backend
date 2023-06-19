# Song Request Backend

This is a Node.js Express backend for a song request website. It allows users to submit song requests and view the list of requested songs.

## Features

- Receive song requests with the applicant's name, student number, song title, and singer.
- Store the requested songs in a database.
- Limit the number of song requests to 10 per day.
- Prevent duplicate song requests for the same singer or song.
- Implement a blacklist to block specific users from making song requests.

## Requirements

- Node.js (version 12 or above)
- npm or yarn

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```
   cd song-request-backend
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Start the server:

   ```
   npm start
   ```

   The server will start running on `http://localhost:3000`.

## Usage

- To make a song request, send a POST request to `/song-request` with the following parameters in the request body:
  - `name`: Name of the applicant
  - `studentNumber`: Student number of the applicant
  - `songTitle`: Title of the song
  - `singer`: Name of the singer
  If the request is valid, the server will store the song request.
  If the request is invalid, an error message will be returned.

- To view the list of requested songs, send a GET request to `/view-request`. The server will respond with a JSON array of requested songs.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).