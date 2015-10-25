"use strict";

var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var l = require('../core/lib/logger').logger;
  
l.info('Router index loaded.');

fs.readdirSync(path.join(__dirname, './'))
  .forEach(function(file) {

    if (file.match(/\.js$/) !== null && file !== 'index.js') {
      let subRouter = require(path.join(__dirname, file));
      router.use('/', subRouter);
    } 

  });

module.exports = router;
