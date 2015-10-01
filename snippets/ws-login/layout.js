var path = require('path');
var App = require('app');
var fs = require('fs');

var Handlebars = require('handlebars');
var debug = App.debugFactory('snippet:login:layout');
var controller = require('./controller');
var $ = require('jquery');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

App.eventReqres.setHandler("render:login" , function() {
  return LayoutView;
});

var LayoutView = App.LayoutView.extend({   
  
  template: Handlebars.compile(layoutTemplate),
  
  ui: {
    username: '#inputEmail',
    password: '#inputPassword',
    signin: '.btn-signin'
  },
  
  onRender: function() {
    debug('render');    
    this.renderNested();
  },
  
  events: {
    'submit .form-signin': 'login'
  },
  
  login: function(e) {
    e.preventDefault();
    
    $('.login-failed', this.$el).remove();
    
    $.post('/api/login', 
      { 
        username: $('#inputEmail').val(),
        password: $('#inputPassword').val()
      }, 
      function(data) {
        if (data.error) {
          $('#remember').after('<p class="bg-danger login-failed">Sikertelen bejelentkezés!</p>');
        } else {
          location.reload();
        }      
      }, 
      'json'
    );
  }
  
});

module.exports = LayoutView;
