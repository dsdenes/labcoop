var path = require('path');
var App = require('app');
var fs = require('fs');
var co = require('co');
var Auth = require('../../lib/auth');

var Handlebars = require('handlebars');
var debug = App.debugFactory('snippet:header:layout');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

var $ = require('jquery');

App.eventReqres.setHandler("render:header" , function(){
  return LayoutView;
});

var LayoutView = App.LayoutView.extend({   
  
  template: Handlebars.compile(layoutTemplate),
  
  id: 'ws-header',
  className: 'container-fluid',
  
  onShow: function() {

    var _this = this;
    
    co(function*() {
      _this.showLoggedin(yield Auth.isLoggedin());
    });

    App.vent.on('loggedin', function(loggedin) {
      _this.showLoggedin(loggedin);
    });    
    
  },                  

  showLoggedin: function(loggedin) {
    if (loggedin) {
      this.$el.find('.loggedout').hide();
      this.$el.find('.loggedin').show();
    } else {
      this.$el.find('.loggedin').hide();
      this.$el.find('.loggedout').show();
    }
  }                   
  
});

module.exports = LayoutView;
