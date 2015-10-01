"use strict";

var express = require('express');
var router = express.Router();
var format = require('util').format;
var l = require('../logger').logger;
var isAuthenticatedMiddleware = require('../lib/auth').isAuthenticatedMiddleware;
var co = require('co');
var q = require('q');

var Users = require('../db/users');
var Cases = require('../db/cases');
var Tags = require('../db/tags');

//var db = require('../db/items');

l.info(__filename);

router.get('/api/cases/:caseid', isAuthenticatedMiddleware, function(req, res, next) {
  
});

router.get('/api/cases/:caseid/invoice', isAuthenticatedMiddleware, function(req, res, next) {

});

router.post('/api/cases', isAuthenticatedMiddleware, function(req, res, next) {

});

router.put('/api/cases/:id', isAuthenticatedMiddleware, function(req, res, next) {

});

module.exports = router;