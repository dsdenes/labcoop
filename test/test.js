"use strict";

import {assert} from 'chai';
import should from 'should';
import request from 'supertest';
import {execSync} from 'child_process';
import q from 'q';
import co from 'co';
import mongoose from 'mongoose';
import crypto from 'crypto';
import {format} from 'util';

import '../config/config.dev.js';

import connection from '../server/core/db';
import UsersModel from '../server/models/users';
import FoodsModel from '../server/models/foods';

// for accessing session
//import app from '../server/core/server';

import Hash from 'password-hash';

const randEmail = crypto.randomBytes(10).toString('hex') + '@test.hu'

describe('REST API', function() {

  const url = 'http://127.0.0.1:3000';

  before(function(done) {
    this.timeout(10000);

    execSync('(pm2 delete test-app -f -s > /dev/null 2>&1; pm2 start bin/www -f -s --name test-app > /dev/null 2>&1)');
    
    let checkState = function() {
      
      let state = execSync('pm2 list test-app -f -m | grep status').toString().trim();
      
      if (connection.readyState === 1 && state === 'status : online') {
        done();
      } else {
        setTimeout(checkState, 100);
      }
    }

    checkState();
  });

  after(function() {
    this.timeout(10000);
    return execSync('pm2 delete test-app -f -s > /dev/null 2>&1');
  });

  describe('Users', function() {

    it('should throw an error without email', function(done) {

      var userData = {
        password: 'testpass'
      }

      request(url)
        .post('/api/users')
        .send(userData)
        .expect(400)
        .end(done);

    });
    
    it('should throw an error without password', function(done) {

      var userData = {
        email: 'dsdenes@gmail.com'
      }

      request(url)
        .post('/api/users')
        .send(userData)
        .expect(400)
        .end(done);

    });    

    it('should create an user with email and password', function(done) { 

      var userData = {
        email: randEmail,
        password: 'password'
      }
      
      co(function* () {

        yield UsersModel.remove({ email: userData.email });
        
        request(url)
          .post('/api/users')
          .send(userData)
          .expect(204)
          .end(function (err, res) {

            if (err) {
              throw err;
            }

            co(function* () {

              let user = yield UsersModel.findOne({ email: userData.email });

              assert.deepEqual(user.email, randEmail);
              assert.deepEqual(user.username, randEmail);
              assert.deepEqual(true, Hash.verify('password', user.password));

              yield UsersModel.remove({ email: userData.email });

              done();

            }).catch(function (error) {

              UsersModel.remove({ email: userData.email })
                .then(function() {
                  done(error);
                });

            });

          });
        
      });

    });
    
    it('should throw error on duplication', function(done) {

      var userData = {
        email: randEmail,
        username: randEmail,
        password: Hash.generate('password')
      }
      
      co(function* () {
      
        yield UsersModel.addUser(userData);

        request(url)
          .post('/api/users')
          .send(userData)
          .expect(500)
          .end(function (err, res) {

            if (err) {
              throw err;
            }

            co(function* () {

              yield UsersModel.remove({ email: userData.email });
              done();

            });

          });         
         
      }).catch(function(error) {

        UsersModel.remove({ email: userData.email })
          .then(function() {
            done(error);
          });
        
      });

    });

  });

  describe('Auth', function() {
    
    let _userId;
    
    before(function (done) {

      co(function* () {

        let user = yield UsersModel.create({
          email: randEmail,
          username: randEmail,
          password: Hash.generate('password')
        });
        
        return;

      })
      .then(done);      
      
    });
    
    after(function (done) {
      
      co(function* () {
        yield UsersModel.remove({ email: randEmail });
        done();
      });      
      
    });
    
    it('should response unauthenticated when not logged in', function(done) { 

      co(function* () {

        request(url)
          .get('/api/auth/user')
          .expect(401)
          .end(done);

      }).catch(done);

    });    
    
    it('should be able to log in with email and password', function(done) { 

      co(function* () {
        
        let loginData = {
          username: randEmail,
          password: 'password'
        };

        request(url)
          .post('/api/auth/login')
          .send(loginData)
          .expect(204)
          .end(function (err, res) {
          
            if (err) {
              throw err;
            }
          
            let cookies = res.headers['set-cookie'].pop().split(';')[0];

            co(function* () {
              
              let req = request(url)
                .get('/api/auth/user');
              
              req.cookies = cookies;
              
              req.set('Accept','application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                
                  assert.deepEqual(res.body.email, randEmail);

                  done();

                });

            }).catch(function (error) {
              done(error);
            });

        });

      });

    });

  });
  
  describe('Foods', function() {
    
    let _userId;
    let _cookies;
    
    before(function (done) {

      co(function* () {

        let user = yield UsersModel.create({
          email: randEmail,
          username: randEmail,
          password: Hash.generate('password')
        });
        
        _userId = user._id;
        
        let loginData = {
          username: randEmail,
          password: 'password'
        }
        
        // login
        request(url)
          .post('/api/auth/login')
          .send(loginData)
          .expect(204)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            _cookies = res.headers['set-cookie'].pop().split(';')[0];
          
            done();
          });

      });    

    });

    after(function (done) {

      co(function* () {
        yield UsersModel.remove({ email: randEmail });
        done();
      });      

    });

    it('should respont with 401 when not logged in', function(done) {

      var foodData = {
        
      }

      request(url)
        .post('/api/foods')
        .send(foodData)
        .expect(401)
        .end(done);

    });
    
    it('should throw an error without food name', function(done) {

      var foodData = {
        calories: 70
      }

      let req = request(url)
        .post('/api/foods');
      
      req.cookies = _cookies;
      
      req.send(foodData)
        .expect(400)
        .end(done);

    });
    
    it('should throw an error without calories', function(done) {

      var foodData = {
        food: 'vmi'
      }

      let req = request(url)
        .post('/api/foods');

      req.cookies = _cookies;

      req.send(foodData)
        .expect(400)
        .end(done);

    });
    
    it('should throw an error when gets incorrect data', function(done) {

      var foodData = {
        calories: 'fsdfsd'
      }

      let req = request(url)
        .post('/api/foods');

      req.cookies = _cookies;

      req.send(foodData)
        .expect(400)
        .end(done);

    });
   
    it('should create a food entry', function(done) { 

      var foodData = {
        food: crypto.randomBytes(20).toString('hex'),
        calories: Math.floor(Math.random() * 200)
      }

      co(function* () {

        yield FoodsModel.remove({ food: foodData.food });

        let req = request(url)
          .post('/api/foods');

        req.cookies = _cookies;

        req.send(foodData)
          .expect(204)
          .end(function (err, res) {
          
            if (err) {
              throw err;
            }

            co(function* () {

              let food = yield FoodsModel.findOne({ food: foodData.food });

              assert.deepEqual(food.food, foodData.food);
              assert.deepEqual(food.calories, foodData.calories);
              assert.deepEqual(food.user_id, _userId);

              yield FoodsModel.remove({ food: foodData.food });
              
              done();

            }).catch(function (error) {

              FoodsModel.remove({ food: foodData.food })
                .then(function() {
                  done(error);
                });

            });

          });

      });

    });

    it('should modify food entry', function(done) {

      var foodData = {
        food: crypto.randomBytes(20).toString('hex'),
        calories: Math.floor(Math.random() * 200),
        user_id: _userId
      }
      
      var modifyFoodData = {
        food: crypto.randomBytes(20).toString('hex'),
        calories: Math.floor(Math.random() * 200),
        user_id: _userId
      }

      co(function* () {

        let foodEntry = yield FoodsModel.create(foodData);
        
        let req = request(url)
          .put(format('/api/foods/%s', foodEntry._id));
        
        req.cookies = _cookies;
        
        req.send(modifyFoodData)
          .expect(204)
          .end(function (err, res) {

            if (err) {
              throw err;
            }

            co(function* () {
              
              let newFoodEntry = yield FoodsModel.findOne({ _id: foodEntry._id });
              
              assert.deepEqual(newFoodEntry.food, modifyFoodData.food);
              assert.deepEqual(newFoodEntry.calories, modifyFoodData.calories);

              yield FoodsModel.remove({ _id: foodEntry._id });
              
              done();

            });

          });         

      }).catch(function(error) {

        FoodsModel.remove({ _id: foodEntry._id })
          .then(function() {
            done(error);
          });

      });

    });

  });


}); 
