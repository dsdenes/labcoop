"use strict";

var express = require('express');
var router = express.Router();
var format = require('util').format;

var Logger = require('../core/lib/logger');
var l = Logger.logger;

var Auth = require('../core/lib/auth');
var User = require('../core/lib/user');

var co = require('co');
var q = require('q');
var _ = require('underscore');
var crypto = require('crypto');
var Hash = require('password-hash');

//var db = require('../db/items');

l.info(__filename);

/** 
 * @api {post} /api/users Get all users
 * @apiName getUserList
 * @apiGroup Users
 *
 * @apiSuccess {Array} users List of user objects.
 */
router.get('/api/users', Auth.isAuthenticatedMiddleware, function(req, res, next) {
  co(function* () {

    let users = yield q.ninvoke(UsersModel, 'find', {});

    res.json(users);

  }).catch(function(error) {
    next(error);
  });
});

/**
 * @api {post} /api/signup Sign up a user only with email (without password)
 * @apiName signup-email
 * @apiGroup Auth
 *
 * @apiParam {String} username E-mail address as username
 *
 */
router.post('/api/users/email', function(req, res, next) {

    if (!req.body.email) {
      let error = new Error('Wrong call');
      error.status = 400;
      next(error);
    }
  
    req.body.token = crypto.randomBytes(32).toString('hex');
    req.body.type = 'user';

    next();

  },             
  User.addUserMiddleware,             
  User.sendActivateEmailMiddleware,
  function(req, res, next) {
    res.status(204).end();
  }
);  

router.post('/api/users', 
  function(req, res, next) {

    if (!req.body.email || !req.body.password) {
      let error = new Error('Wrong call');
      error.status = 400;
      next(error);
    }

    req.body.token = crypto.randomBytes(32).toString('hex');
    req.body.type = 'user';
  
    next();

  }, 
  User.addUserMiddleware, 
  Auth.authenticateLocalMiddleware,
  function(req, res, next) {
    res.status(204).end();
  }
);            

/**
 * @api {get} /api/users/:userid Get one user by id
 * @apiName getUser
 * @apiGroup Users
 *
 * @apiSuccess {Object} user Object of a user.
 */
router.get('/api/users/:userid', Auth.isAuthenticatedMiddleware, function(req, res, next) {
  co(function* () {

    let userid = req.params.userid; 

    let user = yield q.ninvoke(UsersModel, 'findOne', { _id: userid });
    
    delete user.password;
    delete user.oauth;
    delete user.__v;

    res.json(user);

  }).catch(function(error) {
    next(error);
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
router.put('/api/users/:userid', 
  Auth.isAuthenticatedMiddleware,
  Auth.justOwnerUrlIdMiddleware, 
  function(req, res, next) {

    co(function* () {

      let userId = req.params.userid; 
      let updateData = _.extend({}, req.body);

      delete updateData._id;
      delete updateData.__v;
      delete updateData.type;
      delete updateData.oauth;
      delete updateData.created;

      delete updateData.email;
      delete updateData.username;

      if (updateData.password) {
        updateData.password = Hash.generate(updateData.password);
      }

      updateData.modified = new Date();

      yield q.ninvoke(UsersModel, 'update', { _id: userId }, updateData, { runValidators: true });

      if (
        updateData.name &&
        updateData.phone &&
        updateData.password
      ) {

        q.ninvoke(UsersModel, 'update', { 
          _id: userId,  
          token: {
            $exists: true
          }
        }, { 
          $unset: {
            token: 1
          }
        });
        
      }

      res.status(204).end();

    }).catch(function(error) {
      next(error);
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
router.get('/api/users/:userid/cases', Auth.isAuthenticatedMiddleware, function(req, res, next) {
  co(function* () {

    let userId = req.params.userid; 

    let userType = (yield q.ninvoke(UsersModel, 'findOne', { _id: userId }))['type'];

    let filter = {};

    switch (userType) {
      case 'user':
        filter['user._id'] = userId; 
        break;
      case 'salesrep':
        filter['salesrep_id'] = userId; 
        break;
      case 'lawyer':
        filter['lawyer._id'] = userId; 
        break;
    }

    let cases = yield q.ninvoke(CasesModel, 'find', filter);

    res.json(cases);

  }).catch(function(error) {
    next(error);
  });
});

module.exports = router;
