const fs = require('fs'),
path = require('path'),
NodeID3 = require('node-id3'),
getMP3Duration = require('get-mp3-duration'),
HashMap = require('hashmap'),
md5File = require('md5-file'),
cliProgress = require('cli-progress');

var songsList = new HashMap();

const getDirectories = source => fs.readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

const playlistsDir = '/Users/Arjun/Deezloader Music/';

var playlists = getDirectories(playlistsDir);

var totalSongs = 0;

for (var i = 0; i < playlists.length; i++) {
    var playlistDir = path.join(playlistsDir, playlists[i]);
    totalSongs += fs.readdirSync(playlistDir).filter( ( elm ) => elm.match(/.*\.(mp3?)/ig)).length;
}

const progressBar = new cliProgress.SingleBar({
    format: 'Loading songs... |' + '{bar}' + '| {percentage}%',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
});

progressBar.start(totalSongs, 0);

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

        const hash = md5File.sync(filePath);

        currList.push({
            file: dirent.name,
            title: tags['title'],
            artist: tags['artist'],
            duration: durationSeconds,
            album: tags['album'],
            hash: hash,
        });

        progressBar.increment();
        progressBar.update();
      }
    }
    playlistDirHandle.closeSync();

    songsList.set(playlists[i], currList);
}

progressBar.stop();

let getSongsList = function() {
    return songsList;
};

module.exports.getSongsList = getSongsList;