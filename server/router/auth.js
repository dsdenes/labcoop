"use strict";

var express = require('express');
var router = express.Router();
var format = require('util').format;
var l = require('../logger').logger;
var _ = require('underscore');
var passport = require('passport');
var response = require('../lib/response');
var isAuthenticatedMiddleware = require('../lib/auth').isAuthenticatedMiddleware;

var Users = require('../db/users');

l.info(__filename);

router.all('/api/static/login/failed', function(req, res) {
  res.json(response.error('Failed to login!'));
});

router.all('/api/static/login/success', function(req, res) {
  res.json(response.result('Login succeed!'));
});

/**
 * @api {get} /api/login Check if the user is logged in.
 * @apiName isAuthenticated
 * @apiGroup Auth
 *
 * @apiSuccess {Object} user Loggedin user.
 */
router.get('/api/login', isAuthenticatedMiddleware, function(req, res) {
  res.json(req.user);
});

/**
 * @api {post} /api/login Authenticate user by username / password.
 * @apiName login
 * @apiGroup Auth
 *
 * @apiParam {String} username Users unique ID.
 * @apiParam {String} password Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/api/login', 
  passport.authenticate('local', {
    successRedirect: '/api/static/login/success',
    failureRedirect: '/api/static/login/failed'
  }));

/**
 * @api {post} /api/logout Logout
 * @apiName logout
 * @apiGroup Auth
 *
 */
router.get('/api/logout', function(req, res, next) {
  req.logout();
  req.session.save(function (err) {
    if (err) {
      return next(err);
    }
    res.json(response.result('Logout succeed!'));
  });
});

module.exports = router;