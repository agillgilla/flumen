var express = require('express'),
fs = require('fs'),
path = require('path'),
util = require('util'),
assert = require('assert'),
lame = require("@suldashi/lame"),
Speaker = require('speaker');



var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('listen', {});
  /*
  var filePath = '/Users/Arjun/Deezloader Music/MUSIC/AC_DC - Back In Black.mp3';
  var stat = fs.statSync(filePath);

  var filestream = fs.createReadStream('file.mp3');
  var range = request.headers.range.replace("bytes=", "").split('-');

  
  var readStream = fs.createReadStream(filePath);
  // We replaced all the event handlers with a simple call to util.pump()
  readStream.pipe(res);

  res.on('unpipe', (src) => {
    console.error('Something has stopped piping into the writer.');
    assert.equal(src, readStream);
  });
  */  

});

module.exports = router;

