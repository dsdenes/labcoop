"use strict";

var express = require('express');
var router = express.Router();
var format = require('util').format;
var l = require('../logger').logger;
var isAuthenticatedMiddleware = require('../lib/auth').isAuthenticatedMiddleware;
var co = require('co');
var q = require('q');
var _ = require('underscore');

var Users = require('../db/users');
var Cases = require('../db/cases');
var Tags = require('../db/tags');

//var db = require('../db/items');

l.info(__filename);

/**
 * @api {post} /api/users Get all users
 * @apiName getUserList
 * @apiGroup Users
 *
 * @apiSuccess {Array} users List of user objects.
 */
router.get('/api/users', isAuthenticatedMiddleware, function(req, res, next) {
  co(function* () {

    let users = yield q.ninvoke(Users, 'find', {});

    res.json(users);

  }).catch(function(error) {
    res.status(500).send(error);
  });
});

/**
 * @api {post} /api/signup Sign up a user with username / password.
 * @apiName signup
 * @apiGroup Auth
 *
 * @apiParam {String} username Username
 * @apiParam {String} password Password
 *
 */
router.post('/api/users', function(req, res, next) {
  
  return co(function* () {

    let userData = _.extend({}, req.body);
    
    if (userData.username && !userData.password) {
      next(new Error('Password missing!'));
    }

    if (userData.password && !userData.username) {
      next(new Error('Username missing!'));
    }
    
    if (userData.username && userData.password) {
      return addUserPassword(req, res, next);
    }
    
    return addUser(req, res, next);
    
  }).catch(function(error) {
    next(error);
  });
  
});

let addUserPassword = function(req, res, next) {

  return co(function* () {

    let userData = _.extend({}, req.body);

    Users.register(new Users(userData), userData.password, function(err, account) {

      if (err) {
        return next(err);
      }

      passport.authenticate('local')(req, res, function () {
        req.session.save(function (err) {
          if (err) {
            return next(err);
          }
          res.json(response.result('Signup succeed!'));
        });
      });

    });

  }).catch(function(error) {
    next(error);
  });

};

let addUser = function(req, res, next) {

  return co(function* () {

    let userData = _.extend({}, req.body);

    let user = yield q.ninvoke(Users, 'create', userData);
    
    res.json(user);

  }).catch(function(error) {
    next(error);
  });

};

/**
 * @api {get} /api/users/:userid Get one user by id
 * @apiName getUser
 * @apiGroup Users
 *
 * @apiSuccess {Object} user Object of a user.
 */
router.get('/api/users/:userid', isAuthenticatedMiddleware, function(req, res, next) {
  co(function* () {

    let userid = req.params.userid; 

    let user = yield q.ninvoke(Users, 'findOne', { _id: userid });

    res.json(user);

  }).catch(function(error) {
    res.status(500).send(error);
  });
});

/**
 * @api {put} /api/users/:id Modify user
 * @apiName getUser
 * @apiGroup Users
 *
 * @apiParam {String} name Name
 * @apiParam {String} email E-mail
 
 * @apiSuccess {Object} user Object of a user.
 */
router.put('/api/users/:userid', isAuthenticatedMiddleware, function(req, res, next) {

  co(function* () {

    let userId = req.params.userid; 
    let updateData = _.extend({}, req.body);
    
    yield q.ninvoke(Users, 'update', { _id: userId }, updateData);

    res.status(204).end();

  }).catch(function(error) {
    res.status(500).send(error);
  });

});

/**
 * @api {post} /api/users/:userid/cases Get cases for user.
 * @apiName getCasesByUserId
 * @apiGroup Cases
 *
 * @apiParam {String} userid Users unique ID.
 *
 * @apiSuccess {Array} cases Array of cases belonging to a user.
 */
router.get('/api/users/:userid/cases', isAuthenticatedMiddleware, function(req, res, next) {
  co(function* () {

    let userId = JSON.parse(req.params.userid); 

    let userType = (yield q.ninvoke(Users, 'findOne', { _id: userId }))['type'];

    let filter = {};

    switch (type) {
      case 'user':
        filter['user_id'] = userId; 
        break;
      case 'salesrep':
        filter['salesrep_id'] = userId; 
        break;
      case 'lawyer':
        filter['lawyer_id'] = userId; 
        break;
    }

    let cases = yield q.ninvoke(Cases, 'find', filter);

    res.json(cases);

  }).catch(function(error) {
    res.status(500).send(response.error(error));
  });
});

module.exports = router;