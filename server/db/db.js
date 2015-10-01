var mongoose = require('mongoose');
var format = require('util').format;
var l = require('../logger').logger;  
var autoIncrement = require('mongoose-auto-increment');

process.env.DB_PORT = (process.env.DB_PORT) ? process.env.DB_PORT : 27017; 

var dburi = format('mongodb://%s:%d/%s', process.env.DB_HOST, process.env.DB_PORT, process.env.DB_DATABASE);

l.info('Connecting to: ' + dburi);

module.exports = connection = mongoose.createConnection(dburi, {
  server: {
    auto_reconnect: true
  }
});

autoIncrement.initialize(connection);

// When successfully connected
connection.on('connected', function () {  
  l.info('Mongoose connection open to ' + dburi);
}); 

// If the connection throws an error
connection.on('error',function (err) {  
  l.error(err);
}); 

// When the connection is disconnected
connection.on('disconnected', function () {  
  l.warn('Mongoose connection disconnected'); 
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
  connection.close(function () { 
    l.warn('Mongoose connection disconnected through app termination'); 
    process.exit(0); 
  }); 
}); 