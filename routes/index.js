var express = require('express');
const { readdirSync } = require('fs');
var path = require('path');


var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	const getDirectories = source => readdirSync(source, { withFileTypes: true })
    	.filter(dirent => dirent.isDirectory())
    	.map(dirent => dirent.name);

    var playlistsDir = '/Users/Arjun/Deezloader Music/';

    var playlists = getDirectories(playlistsDir);

    for (var i = 0; i < playlists.length; i++) {
    	console.log(path.join(playlistsDir, playlists[i]));
    }

  	res.render('index', {});
});

module.exports = router;
