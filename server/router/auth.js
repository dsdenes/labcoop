"use strict";

var express = require('express');
var router = express.Router();
var format = require('util').format;
var l = require('../core/lib/logger').logger;
var _ = require('underscore');
var passport = require('passport');
var isAuthenticatedMiddleware = require('../core/lib/auth').isAuthenticatedMiddleware;

var util = require('util');

var UsersModel = require('../models/users');
var Auth = require('../core/lib/auth');

l.info(__filename);

router.all('/api/static/login/failed', function(req, res, next) {
  next(new Error('Failed to login+'));
});

router.all('/api/static/login/success', function(req, res) {
  res.send(true).end();
});

/**
 * @api {get} /api/login Check if the user is logged in.
 * @apiName isAuthenticated
 * @apiGroup Auth
 *
 * @apiSuccess {Object} user Loggedin user.
 */
router.get('/api/auth/user', isAuthenticatedMiddleware, function(req, res) {
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
router.post('/api/auth/login', 
  passport.authenticate('local'), function(req, res) {
    res.status(204).end();
  });

router.post('/api/auth/login/token', 
  Auth.authenticateTokenMiddleware, 
  function(req, res) {
    res.status(204).end();
  });
/**
 * @api {post} /api/logout Logout
 * @apiName logout
 * @apiGroup Auth
 *
 */
router.get('/api/auth/logout', function(req, res, next) {
  req.logout();
  req.session.save(function (err) {
    if (err) {
      return next(err);
    }
    res.status(204).end();
  });
});

router.get('/api/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email'] }));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/#login' }), function(req, res) {
  
  res.redirect('/#account');
  
});

module.exports = router;
