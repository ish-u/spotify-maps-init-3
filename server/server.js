import express, { query } from "express";
import cors from "cors";

import SpotifyWebApi from "spotify-web-api-node";

// Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// route to get Playlist
app.get("/getData/:country/:token", async (req, res) => {
  const token = req.params.token;
  const spotify = new SpotifyWebApi();
  let playlistID = null;
  spotify.setAccessToken(token);

  // get the playlist URI
  await spotify.searchPlaylists(`Top 50 - ${req.params.country}`).then(
    function (data) {
      // res.send(data.body.playlists);
      if (data.body.playlists.items.length) {
        playlistID = data.body.playlists.items[0].id;
      } else {
        res.send("Error");
      }
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );

  //get playlist
  if (playlistID !== null) {
    await spotify.getPlaylist(playlistID).then(
      function (data) {
        res.send(data.body);
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }
});

// for 404
app.use("*", (req, res) => res.json({ error: "error" }));

// exporting the App
export default app;
