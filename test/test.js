"use strict";

let should = require('should'); 
//let assert = require('chai');
let assert = require('chai').assert;
let request = require('supertest'); 

require('../app/config/config.dev');
var dbUsers = require('../app/server/db/users');
var dbCases = require('../app/server/db/cases');
var connection = require('../app/server/db/db');
var mongoose = require('mongoose');
var co = require('co');

describe('API', function() {
  
  let url = 'http://127.0.0.1:3000';
  
  // wait for database connection
  before(function(done) {
    this.timeout(30000);
    let checkConnection = function() {
      if (connection.readyState === 1) {
        done();
      } else {
        setTimeout(checkConnection, 100);
      }
    } 
    checkConnection();
  });
  
  describe('Users', function() {
  
    it('should get the list of users', function(done) {
      
      request(url)
        .get('/api/users')
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          
          assert.equal(res.status, 200, 'No error');
          assert.typeOf(res.body, 'array', 'Return type');
        
          done();
      });

    });

    it('should throw an error without type', function(done) {
      
      var userData = {
        email: 'dsdenes@gmail.com'
      }

      request(url)
        .post('/api/users')
        .send(userData)
        .end(function(err, res) {
        if (err) {
          throw err;
        }

        assert.equal(res.status, 500, 'Throws error');

        done();
      });

    });
    
    it('should create an user with email', function(done) {

      co(function* () { 
        "use strict"
         
        var userData = {
          email: 'test@test.hu',
          type: 'administrator'
        }

        request(url)
          .post('/api/users')
          .send(userData)
          .end(function(err, res) {
          
            if (err) {
              throw err;
            }

            assert.equal(res.status, 200, 'No error');
            assert.typeOf(res.body, 'object', 'Return type');
            assert.deepEqual(res.body.email, 'test@test.hu');
            assert.deepEqual(res.body.type, 'administrator');

            yield q.ininvoke(dbUsers, 'remove', { _id: res.body._id });

          done();

         });
         
      });

    });

  });
  
});