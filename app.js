const PORT = 80;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var listenRouter = require('./routes/listen');
var streamMusicRouter = require('./routes/streamMusic');
var songsListRouter = require('./routes/songsList');
var fetchPlaylistsRouter = require('./routes/fetchPlaylists')

var fetchSongApi = require('./api/fetchSong');
var songsListApi = require('./api/songsList');
var fetchPlaylistsApi = require('./api/fetchPlaylists')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/public',express.static(path.join(__dirname, 'public')));
app.use('/img',express.static(path.join(__dirname, 'public/images')));
app.use('/js',express.static(path.join(__dirname, 'public/javascripts')));
app.use('/css',express.static(path.join(__dirname, 'public/stylesheets')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/listen', listenRouter);
app.use('/streamMusic', streamMusicRouter);
app.use('/songsList', songsListRouter);
app.use('/fetchPlaylists', fetchPlaylistsRouter);

app.use('/api/fetchSong', fetchSongApi);
app.use('/api/songsList', songsListApi);
app.use('/api/fetchPlaylists', fetchPlaylistsApi);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}...`);
});
