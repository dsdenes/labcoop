var path = require('path');
var App = require('app');
var fs = require('fs');
var co = require('co');

var Handlebars = require('handlebars');
var debug = App.debugFactory('snippet:login:layout');
var controller = require('./controller');
var $ = require('jquery');
var format = require('util').format;
var Auth = require('../../lib/auth');
var User = require('../../lib/user');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

App.eventReqres.setHandler("render:login" , function() {
  return LayoutView;
});

var LayoutView = App.LayoutView.extend({   
  
  initialize: function(options) {
    this.options = options;
  },
  
  template: Handlebars.compile(layoutTemplate),
  
  className: 'container-fluid',
  
  id: 'ws-login',
  
  goNext: function() {

    let navigateTarget = this.options.where ? this.options.where : 'account';
    
    App.router.navigate(navigateTarget, { trigger: true });
    
  },
  
  onRender: function() {
    
    let _this = this;
    
    this.renderNested();
    
    co(function*() {
      if (yield Auth.isLoggedin()) {
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
  
  signin: function(event) {
    
    let _this = this;
    
    event.preventDefault();
    
    this.$el.find('#form-signin button').addClass('ajax');
    
    this.$el.find('.message').remove();
    
    co(function*(){
      
      yield Auth.login(
        $('#form-signin input[name="email"]').val(), 
        $('#form-signin input[name="password"]').val()
      );
      
    }).catch(function(error) {
      $('#form-signin .box').append('<p class="bg-danger message">Sikertelen bejelentkezés!</p>');
    });
    
  },
  
  signup: function(event) {
    
    event.preventDefault();

    this.$el.find('#form-signup button').addClass('ajax');

    this.$el.find('.message').remove();
    
    co(function*(){
    
      yield User.signupEmail(
        $('#form-signup input[name="email"]').val()
      );
      
      $('#form-signup .box').append(format('<p class="bg-success message">%s</p>', 'Gratulálunk, a megadott e-mail címre küldött linken keresztük folytathatja a regisztrációt!'));
      
    }).catch(function(error) {
      
      var text;

      try {
        switch (true) {
          case (/duplicate key/i.test(error.responseText)):
            text = 'A megadott e-mail címmel már van regisztrált felhasználó!'
            break;
          case (/validation failed/i.test(error.responseText)):
            text = 'A megadott e-mail cím hibásnak néz ki!'
            break;
          default:
            text = 'Valami nem jó!';
            break;
        }
      } catch (error) {
        text = 'Sikertelen regisztráció!';
      }    
      
      $('#form-signup .box').append(format('<p class="bg-danger message">%s</p>', text));
    });

    /*
      error: function(xhr, textStatus) {

        var text;

        try {
          switch (true) {
            case (xhr.responseJSON.code == 11000):
              text = 'A megadott e-mail címmel már van regisztrált felhasználó!'
              break;
            case (xhr.responseJSON.name == 'ValidationError'):
              text = 'A megadott e-mail cím hibás!'
              break;
          }
        } catch (error) {
          text = 'Sikertelen regisztráció!';
        }

        $('#form-signup .box').append(format('<p class="bg-danger message">%s</p>', text));
      }
      */
  }
  
});

module.exports = LayoutView;
