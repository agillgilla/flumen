const express = require('express'),
HashMap = require('hashmap');

var songsList;

let setSongsList = function(newSongsList) {
    songsList = newSongsList;
};

var router = express.Router();

/* Fetch songs list */
router.get('/', function(req, res, next) {
    
    res.json(songsList.get(req.query.playlist));

});

module.exports.router = router;
module.exports.setSongsList = setSongsList;