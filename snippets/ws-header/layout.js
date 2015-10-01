var path = require('path');
var App = require('app');
var fs = require('fs');

var Handlebars = require('handlebars');
var debug = App.debugFactory('snippet:header:layout');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
var scroll = require('smooth-scroll');

var $ = require('jquery');

App.eventReqres.setHandler("render:header" , function(){
  return LayoutView;
});

var LayoutView = App.LayoutView.extend({   
  
  template: Handlebars.compile(layoutTemplate),
  
  id: 'ws-header',
  
  events: {
    'click .nav li a': function(event) {
      
      var $target = $(event.target);
      
      if (window.location.hash && window.location.hash.match(/content\//)) {
        App.router.navigate('', { trigger: true });    
      } 
      
      scroll.animateScroll(null, $target.attr('href'));
    }
  }
  
});

module.exports = LayoutView;
