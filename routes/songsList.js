var express = require('express'),
fs = require('fs'),
path = require('path'),
NodeID3 = require('node-id3'),
getMP3Duration = require('get-mp3-duration'),
HashMap = require('hashmap');

console.log("Loading song info...")

var songsList = new HashMap();

const getDirectories = source => fs.readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

const playlistsDir = '/Users/Arjun/Deezloader Music/';

var playlists = getDirectories(playlistsDir);

for (var i = 0; i < playlists.length; i++) {
    var currList = [];

    var playlistDir = path.join(playlistsDir, playlists[i]);

    //const playlistDir = 'C:/Users/Arjun/Deezloader Music/MUSIC';
    const playlistDirHandle = fs.opendirSync(playlistDir);
    let dirent;
    while ((dirent = playlistDirHandle.readSync()) !== null) {
      //console.log(dirent.name)

      if (dirent.name.endsWith(".mp3")) {

        var filePath = path.join(playlistDir, dirent.name);

        var buffer = fs.readFileSync(filePath);
        var durationMillis = getMP3Duration(buffer);
        var durationSeconds = durationMillis / 1000;

        let tags = NodeID3.read(filePath);

        currList.push({
            file: dirent.name,
            title: tags['title'],
            artist: tags['artist'],
            duration: durationSeconds,
            album: tags['album'],
        });
      }
    }
    playlistDirHandle.closeSync();

    songsList.set(playlists[i], currList);
}




var router = express.Router();

/* Fetch songs list */
router.get('/', function(req, res, next) {
    
    res.json(songsList.get(req.query.playlist));

});

module.exports = router;