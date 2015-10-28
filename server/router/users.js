"use strict";

var express = require('express');
var router = express.Router();
var format = require('util').format;

var Logger = require('../core/lib/logger');
var l = Logger.logger;

var UsersModel = require('../models/users');
var FoodsModel = require('../models/foods');

var Auth = require('../core/lib/auth');
var User = require('../core/lib/user');

var co = require('co');
var q = require('q');
var _ = require('underscore');
var crypto = require('crypto');
var Hash = require('password-hash');

l.info(__filename);

/**
 * @api {post} /api/users Sign up an user by email and password
 * @apiName userSignup
 * @apiGroup Users
 */
router.post('/api/users', 
  function(req, res, next) {

    if (!req.body.email || !req.body.password) {
      let error = new Error('Wrong call');
      error.status = 400;
      next(error);
    }

    req.body.token = crypto.randomBytes(32).toString('hex');
  
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
router.get('/api/users/:userid', 
  Auth.isAuthenticatedMiddleware, 
  Auth.justOwnerUrlIdMiddleware,         
  function(req, res, next) {
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
      delete updateData.oauth;
      delete updateData.created;

      delete updateData.email;
      delete updateData.username;

      if (updateData.password) {
        updateData.password = Hash.generate(updateData.password);
      }

      updateData.modified = new Date();

      yield q.ninvoke(UsersModel, 'update', { _id: userId }, updateData, { runValidators: true });

      res.status(204).end();

    }).catch(function(error) {
      next(error);
    });

  });

/**
 * @api {get} /api/users/:userid/foods Get foods for user.
 * @apiName getFoodsByUserId
 * @apiGroup Foods
 *
 * @apiParam {String} userid Users unique ID.
 *
 * @apiSuccess {Array} cases Array of foods belonging to a user.
 */
router.get('/api/users/:userid/foods', 
  Auth.isAuthenticatedMiddleware, 
  Auth.justOwnerUrlIdMiddleware,
  function(req, res, next) {
    co(function* () {

      let userId = req.params.userid; 

      let foods = yield q.ninvoke(FoodsModel, 'find', { user_id: userId });

      res.json(foods);

    }).catch(function(error) {
      next(error);
    });
  });

module.exports = router;
