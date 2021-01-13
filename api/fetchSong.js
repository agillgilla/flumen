var express = require('express'),
fs = require('fs'),
path = require('path'),
util = require('util'),
assert = require('assert');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //console.log(req.query.filename);

  const playlistsDir = '/Users/Arjun/Deezloader Music/';

  var playlistDir = path.join(playlistsDir, req.query.playlist);

  var filePath = path.join(playlistDir, req.query.filename);

  /*
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
  */

  try {
    return res.download(filePath, req.query.filename)
  } catch (err) {
      return res.send({ err: 'Problem reading file.', msg: err.toString() })
  }

});

module.exports = router;

