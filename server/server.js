var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')

console.log('-- APP STARTING');

require('../config/config');

var serverApp = express();
module.exports = serverApp;

var logger = require('./logger');
var passport = require('./lib/auth');

serverApp.use(logger.middleware.expressLogger);

// Render html files with hbs
serverApp.set('view engine', 'hbs');
serverApp.engine('html', require('hbs').__express);

serverApp.use(bodyParser.urlencoded({ extended: false }));
serverApp.use(bodyParser.json());
serverApp.use(cookieParser());
serverApp.use(session({ 
  saveUninitialized: false,
  resave: false,
  secret: process.env.EXPRESS_SECRET 
}));
serverApp.use(passport.initialize);
serverApp.use(passport.session);

serverApp.use(require('./router/index'));

serverApp.use("/css", express.static(path.join(process.cwd(), '/public/css')));
serverApp.use("/js", express.static(path.join(process.cwd(), '/public/js')));
serverApp.use("/assets", express.static(path.join(process.cwd(), '/public/assets')));

serverApp.use(logger.middleware.expressErrorLogger);

// Default view directory
serverApp.set('views', path.join(process.cwd(), '/public'));

// Set static serving for the public/
serverApp.use(express.static(path.join(process.cwd(), '/public')));

serverApp.use(logger.middleware.notFound);
serverApp.use(logger.middleware.errorPage);