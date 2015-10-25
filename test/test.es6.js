"use strict";

import {assert} from 'chai';
import should from 'should';
import request from 'supertest';
import execSync from 'child_process';
import co from 'co';
import mongoose from 'mongoose';

require('../config/config.dev');
import connection from '../server/db/db';
import UsersModel from '../server/db/models/users';
import FoodModel from '../server/db/models/food';

describe('REST API', function() {
  
  const url = 'http://127.0.0.1:3000';
  
  before((done) => {
    this.timeout(30000);
    
    execSync('pm2 start bin/www --name app');
    
    let checkConnection = function() {
      if (connection.readyState === 1) {
        done();
      } else {
        setTimeout(checkConnection, 100);
      }
    }
     
    checkConnection();
  });
  
  after((done) => {
    execSync('pm2 delete app');
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

