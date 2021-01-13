var express = require('express'),
fs = require('fs'),
path = require('path'),
util = require('util'),
assert = require('assert');

// Readable Streams Storage Class
class FileReadStreams {
  constructor() {
    this._streams = {};
  }

  make(file, options = null) {
    return options ?
      fs.createReadStream(file, options)
      : fs.createReadStream(file);
  }

  get(file) {
    return this._streams[file] || this.set(file);
  }

  set(file) {
    return this._streams[file] = this.make(file);
  }
}
const readStreams = new FileReadStreams();

// Getting file stats and caching it to avoid disk i/o
function getFileStat(file, callback) {
  let cacheKey = ['File', 'stat', file].join(':');

  cache.get(cacheKey, function(err, stat) {
    if(stat) {
      return callback(null, stat);
    }

    fs.stat(file, function(err, stat) {
      if(err) {
        return callback(err);
      }

      cache.set(cacheKey, stat);
      callback(null, stat);
    });
  });
}

// Streaming whole file
function streamFile(file, req, res) {
  getFileStat(file, function(err, stat) {
    if(err) {
      console.error(err);
      return res.status(404);
    }

    let bufferSize = 1024 * 1024;
    res.writeHead(200, {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': 0,
      'Content-Type': 'audio/mpeg',
      'Content-Length': stat.size
    });
    readStreams.make(file, {bufferSize}).pipe(res);
  });
}

// Streaming chunk
function streamFileChunked(file, req, res) {
  var stat = fs.statSync(file);

  let chunkSize = 1024 * 1024;
  if(stat.size > chunkSize * 2) {
    chunkSize = Math.ceil(stat.size * 0.25);
  }
  let range = (req.headers.range) ? req.headers.range.replace(/bytes=/, "").split("-") : [];

  range[0] = range[0] ? parseInt(range[0], 10) : 0;
  range[1] = range[1] ? parseInt(range[1], 10) : range[0] + chunkSize;
  if(range[1] > stat.size - 1) {
    range[1] = stat.size - 1;
  }
  range = {start: range[0], end: range[1]};

  let stream = readStreams.make(file, range);
  res.writeHead(206, {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': 0,
    'Content-Type': 'audio/mpeg',
    'Accept-Ranges': 'bytes',
    'Content-Range': 'bytes ' + range.start + '-' + range.end + '/' + stat.size,
    'Content-Length': range.end - range.start + 1,
  });
  stream.pipe(res); 
}



var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //console.log(req.query.filename);

  const playlistsDir = '/Users/Arjun/Deezloader Music/';

  var playlistDir = path.join(playlistsDir, req.query.playlist);
  //var playlistPath = '/Users/Arjun/Deezloader Music/50 Latin Classics';

  var filePath = path.join(playlistDir, req.query.filename);
  
  /*
  var returnData = {};

  fs.readFile(filePath, function(err, file){
      var base64File = new Buffer(file, 'binary').toString('base64');

      returnData.fileContent = base64File;

      res.json(returnData);
  });
  */

  var readStream = fs.createReadStream(filePath);

  if(/firefox/i.test(req.headers['user-agent'])) {
    return streamFile(filePath, req, res);
  }
  streamFileChunked(filePath, req, res);
  
  
  


  /*
  // We replaced all the event handlers with a simple call to util.pump()
  readStream.pipe(res);
  */
  /*
  res.on('unpipe', (src) => {
    console.error('Something has stopped piping into the writer.');
    assert.equal(src, readStream);
  });
  */
  

});

module.exports = router;

