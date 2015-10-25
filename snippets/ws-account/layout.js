var path = require('path');
var App = require('app');
var fs = require('fs');

var Handlebars = require('handlebars');
var controller = require('./controller');
var $ = require('jquery');
var format = require('util').format;
var Auth = require('../../lib/auth');
var co = require('co');
var _ = require('underscore');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

var ItemModel = require('../../model/users').Model;
var itemTemplate = fs.readFileSync(path.join(__dirname, 'model.html'), 'utf8');

var LayoutView = App.LayoutView.extend({   
  
  template: Handlebars.compile(layoutTemplate),
  
  className: 'container-fluid',
  
  initialize: function(options) {
    this.options = options;
  },
  
  id: 'ws-account',
  
  render: function() {
    this.$el.html(this.template(this.options));
  },
  
  onShow: function() { 
    this.renderNested();
    var _this = this;
    
    co(function* (){
    
      var userId = yield Auth.getLoggedinUserId();
      
      var itemModel = new ItemModel({
        id: userId
      });

      var itemView = new ItemView({
        model: itemModel
      });

      //itemView.render();

      itemModel.fetch({      
        fail: function() {
          App.router.navigate('login', { trigger: true });
        },
        success: function() {
          if (itemModel.get('token')) {
            App.router.navigate(format('activate/%s/%s', itemModel.get('username'), itemModel.get('token')), { trigger: true });
          }
        }
      });         
      
    }).catch(function(error) {
      App.router.navigate('login', { trigger: true });
    });
    
  },
  
  events: {

  }
  
});

var ItemView = App.Backbone.Marionette.ItemView.extend({

  el: '#ws-account',

  template: Handlebars.compile(itemTemplate),
  
  modelEvents: {
    'change': 'render'
  },
  
  events: {
    'submit #form-account': 'submitForm'
  },
  
  removeError: function() {
    this.$el.find('.message').remove();
  },
  
  message: function(type, message) {
    this.removeError();
    this.$el.find('#form-account button').after(format('<p class="message bg-%s">%s</p>', type, message));
  },
  
  validateForm: function() {
    
    var $form = this.$el.find('#form-account');
    
    var data = _.object($form.serializeArray().map(function(v) {
      return [v.name, v.value];
    }));

    if (!data.name || !data.phone) {
      this.message('danger', 'Kérjük töltsön ki minden mezőt!');
      return false;
    }
    
    if (data.password && data.password !== data.password1) {
      this.message('danger', 'A megadott jelszavak nem egyeznek!');
      return false;
    }
    
    delete data.password1;
    
    return _.pick(data, _.identity);
  },
  
  submitForm: function(event) {
    
    event.preventDefault();
    
    var _this = this;
    
    this.removeError();

    this.$el.find('#form-account button').addClass('ajax');

    var userData;
    if (userData = this.validateForm()) {
      
      this.model.set(userData);
      this.model.save(null, {
        success: function() {
          _this.message('success', 'A felhasználói adatokat sikeresen elmentettük!');
        },
        error: function() {
          App.router.navigate('login', { trigger: true });
        }
      });
      
    }

  },
  
  serializeData: function() {   

    var attribs = _.extend(this.model.attributes, {
      
    });

    return attribs;
  },

  onRender: function() {

  }

});

module.exports = LayoutView;
