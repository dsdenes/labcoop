var expressWinston = require('express-winston');
var winston = require('winston');
var path = require('path');
var util = require('util');

var appLogTransports = [

  // Console logging
  new winston.transports.Console({
    handleExceptions: true,
    json: false,
    name: 'console.info',
    colorize: true,
    level: 'info'
  }),

  // File logging - info
  new winston.transports.File({ 
    handleExceptions: true,
    filename: path.join(process.cwd(), 'app/log/server.log'),
    name: 'file.info',
    level: 'info',
    json: false
  }),

  // File logging - error
  new winston.transports.File({ 
    handleExceptions: true,
    filename: path.join(process.cwd(), 'app/log/error.log'),
    name: 'file.error',
    level: 'error',
    json: false
  })

];

var expressLogTransports = [

  // Console logging
  new winston.transports.Console({
    handleExceptions: true,
    json: false,
    colorize: true,
    name: 'express.info',
    level: 'info'
  }),

  // File logging - info
  new winston.transports.File({ 
    handleExceptions: true,
    json: false,
    colorize: false,
    filename: path.join(process.cwd(), 'app/log/express.log'),
    name: 'express-file.info',
    level: 'info'
  })

];  

var CustomLogger = winston.transports.CustomLogger = function (options) {
  this.name = 'customLogger';
  this.level = options.level || 'info';
};

util.inherits(CustomLogger, winston.Transport);

CustomLogger.prototype.log = function (level, msg, meta, callback) {

  winstonLogger.error(util.format('%s %s', msg, meta.stack[1]));
  
  //console.log('---------------------------------------');
  //console.log(util.format('ERROR: %s %s', msg, meta.stack[1]));
  //console.log('---------------------------------------');

  callback(null, true);
};

var expressErrorLogTransports = [

  // Console logging
  new CustomLogger({
    handleExceptions: true,
    json: true,
    name: 'express.error'
  }),

  // File logging - info
  new winston.transports.File({ 
    handleExceptions: true,
    json: true,
    filename: path.join(process.cwd(), 'app/log/express.log'),
    name: 'express-file.info'
  }),

  // File logging - error
  new winston.transports.File({ 
    handleExceptions: true,
    json: true,
    filename: path.join(process.cwd(), 'app/log/error.log'),
    name: 'express-file.error'
  })

];
  
var winstonLogger = new winston.Logger({
  transports: appLogTransports,
  exitOnError: false
});

winstonLogger.info(__filename);

// catch 404 and forward to error handler
var notFound = function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
};

var errorPage = process.env.NODE_ENV === 'dev' ?  
  function(err, req, res, next) {
    res.status(err.status || 500);
    winstonLogger.warn(util.format('%s %s %d %s', req.method, req.originalUrl, err.status, err.message));
    
    res.json(err);
    
  } : function(err, req, res, next) {
    res.status(err.status || 500);
    winstonLogger.error(err.message);    
    res.render('error', {
      message: err.message,
      error: {}
    });
  };

var expressLogger = expressWinston.logger({
  transports: expressLogTransports,
  expressFormat: true,
  meta: false
});

var expressErrorLogger = expressWinston.errorLogger({
  transports: expressErrorLogTransports,
  statusLevels: true
});

module.exports = {
  logger: winstonLogger,
  middleware: {
    notFound: notFound,
    errorPage: errorPage,
    expressErrorLogger: expressErrorLogger,
    expressLogger: expressLogger
  }
};

