var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const apicache = require('apicache');

const indexRouter = require('./routes/index');
const statsRouter = require('./routes/stats');
const nationalRouter = require('./routes/national');
const internationalRouter = require('./routes/international');
const destinationRouter = require('./routes/destination');

var app = express();
let cache = apicache.middleware;

app.use(cache('5 minutes'))


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

statsRouter,internationalRouter,nationalRouter,destinationRouter.get('/', (req, res, next) => {
  res.send(req.params);
})

// CORS, whom are allow to use the API
app.use(function(req, res, next) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use('/', indexRouter);
app.use('/:city/stats', statsRouter);
app.use('/:city/national', nationalRouter);
app.use('/:city/international', internationalRouter);
app.use('/:city/destination', destinationRouter); 

// Clear all cache
app.get('/api/cache/clear/:pass', (req, res) => {
  if(req.params.pass === 'esilv2019') res.json(apicache.clear())
  else res.send({'response': null})
})


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
