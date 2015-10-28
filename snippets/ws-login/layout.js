// for build time compiler

var fs = require('fs');
const layoutTemplate = fs.readFileSync(__dirname + '/index.html', 'utf8');

// for build time compiler

import co from 'co';
import _ from 'underscore';
import $ from 'jquery';
import Handlebars from 'handlebars';
import { format } from 'util';

import App from 'app';
import { Model as FoodModel } from '../../model/foods';

import { isLoggedin } from '../../lib/auth';
import { login } from '../../lib/auth';

import { signup } from '../../lib/user';

const debug = App.debugFactory('snippet:header:layout');

const LayoutView = App.LayoutView.extend({   
  
  initialize: function(options) {
    this.options = options;
  },
  
  template: Handlebars.compile(layoutTemplate),
  
  className: 'container-fluid',
  
  id: 'ws-login',
  
  goNext: function() {

    // TODO optional navigate target
    //let navigateTarget = this.options.where ? this.options.where : '';
    
    App.router.navigate('', { trigger: true });
    
  },
  
  onRender: function() {
    
    let _this = this;
    
    this.renderNested();
    
    co(function*() {
      if (yield isLoggedin()) {
        _this.goNext();
      }
    });

    App.vent.on('loggedin', function(loggedin) {
      loggedin && _this.goNext();
    });    
    
  },
  
  events: {
    'submit #form-signin': 'signin',
    'submit #form-signup': 'signup'
  },
  
  removeError: function() {
    this.$el.find('.message').remove();
  },

  message: function(form, type, message) {
    this.removeError();
    this.$el.find(format('#form-%s button', form))
      .after(format('<p class="message bg-%s">%s</p>', type, message));
  },
  
  signin: function(event) {

    event.preventDefault();

    let _this = this;
    
    _this.removeError();
    
    co(function*(){
      
      yield login(
        $('#form-signin input[name="email"]').val(), 
        $('#form-signin input[name="password"]').val()
      );
      
    }).catch(function(error) {
      _this.message('signin', 'danger', 'Login failed!');
    });
    
  },
  
  signup: function(event) {
    
    event.preventDefault();

    let _this = this;

    _this.removeError();
    
    co(function*(){
    
      yield signup(
        $('#form-signup input[name="email"]').val(),
        $('#form-signup input[name="password"]').val()
      );
      
      _this.message('signup', 'success', 'Your account has been created!');
      
    }).catch(function(error) {
      
      var text;

      try {
        switch (true) {
          case (/duplicate key/i.test(error.responseText)):
            text = 'There is an other user with this email address!'
            break;
          case (/validation failed/i.test(error.responseText)):
            text = 'The given e-mail address looks incorrect!'
            break;
          default:
            text = 'Something missing, so signup failed!';
            break;
        }
      } catch (error) {
        text = 'Signup failed!';
      }    
      
      _this.message('signup', 'danger', text);

    });

  }
  
});

export { 
  LayoutView 
};