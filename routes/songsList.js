var express = require('express'),
fs = require('fs'),
path = require('path'),
NodeID3 = require('node-id3'),
getMP3Duration = require('get-mp3-duration');

console.log("Loading song info...")

var songsList = [];

const playlistDir = 'C:/Users/Arjun/Deezloader Music/MUSIC';
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

    songsList.push({
        file: dirent.name,
        title: tags['title'],
        artist: tags['artist'],
        duration: durationSeconds,
        album: tags['album'],
    });
  }
}
playlistDirHandle.closeSync();


var router = express.Router();

/* Fetch songs list */
router.get('/', function(req, res, next) {

  res.json(songsList);

});

module.exports = router;