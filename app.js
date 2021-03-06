var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const apicache = require('apicache');
require('dotenv').config()

// Route import
const indexRouter = require('./routes/index');
const statsRouter = require('./routes/stats');
const nationalRouter = require('./routes/national');
const internationalRouter = require('./routes/international');
const destinationRouter = require('./routes/destination');

var app = express();
let cache = apicache.middleware;

app.use(cache('2 days'))


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Accessible routes
// statsRouter,internationalRouter,nationalRouter,destinationRouter.get('/:city', (req, res, next) => {
//   console.log('hello');
//   console.log(req.params.city)
//   res.send(req.params);
// })

app.use('/:city', function(req, res, next){
  process.env.DATABASE = req.params.city;
  var json = require('./config/config.json');
  console.log("A new request received at " + Date.now());
  if(req.params.city in json) next();
  else res.status(404).send(`Database '${req.params.city}' does not exist!`);
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

// Map routes
app.use('/', indexRouter);
app.use('/:city/stats', statsRouter);
app.use('/:city/national', nationalRouter);
app.use('/:city/international', internationalRouter);
app.use('/:city/destination', destinationRouter); 

// Clear all cache
app.get('/cache/clear/:pass?', (req, res) => {
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
