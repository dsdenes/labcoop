"use strict";

var express = require('express');
var router = express.Router();
var format = require('util').format;

var Logger = require('../core/lib/logger');
var l = Logger.logger;

var FoodsModel = require('../models/foods');

var Auth = require('../core/lib/auth');
var User = require('../core/lib/user');

var co = require('co');
var q = require('q');
var _ = require('underscore');

l.info(__filename);

/**
 * @api {post} /api/foods Add a food for the logged in user
 * @apiName foodAdd
 * @apiGroup Foods
 */
router.post('/api/foods', 
  Auth.isAuthenticatedMiddleware,
  function(req, res, next) {

    co(function* () {

      if (!req.body.food || !req.body.calories) {
        let error = new Error('Wrong call');
        error.status = 400;
        next(error);
      }

      let foodData = _.extend({
        user_id: req.user._id
      }, req.body);
      
      yield FoodsModel.create(foodData);

      res.status(204).end();
      
    }).catch(function(error) {
      l.error(error);
      error.status = 400;
      next(error);
    });

  }); 

/**
 * @api {put} /api/foods/:id Modify a food entry by id
 * @apiName updateFoodById
 * @apiGroup Foods
 */
router.put('/api/foods/:foodid', 
  Auth.isAuthenticatedMiddleware,
  Auth.justOwnerDbIdMiddleware, 
  function(req, res, next) {

    co(function* () {

      let foodId = req.params.foodid; 
      let updateData = _.extend({}, req.body);

      delete updateData._id;
      delete updateData.__v;
      delete updateData.created;

      updateData.modified = new Date();

      yield q.ninvoke(FoodsModel, 'update', { _id: foodId, user_id: req.user._id}, updateData, { runValidators: true });

      res.status(204).end();

    }).catch(function(error) {
      error.status = 400;
      next(error);
    });

  });

/**
 * @api {put} /api/foods/:id Modify a food entry by id
 * @apiName updateFoodById
 * @apiGroup Foods
 */
router.delete('/api/foods/:foodid', 
  Auth.isAuthenticatedMiddleware,
  // FIXME check if wants to delete his own entry
  function(req, res, next) {
  
    let foodId = req.params.foodid; 

    co(function* () {

      yield FoodsModel.remove({ _id: foodId });
      
      res.status(204).end();

    }).catch(function(error) {
      error.status = 400;
      next(error);
    });

  });

module.exports = router;
