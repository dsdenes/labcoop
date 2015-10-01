var path = require('path');
var App = require('app');
var fs = require('fs');

var Handlebars = require('handlebars');
var debug = App.debugFactory('snippet:adminMenu:layout');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

App.eventReqres.setHandler("render:adminMenu" , function(options){
  return LayoutView;
});

var LayoutView = App.LayoutView.extend({   
  
  template: Handlebars.compile(layoutTemplate),
  
  onRender: function() {
    debug('render');    
    this.renderNested();
  },
  
  events: {
    'click .mainPage': function() {
      App.router.navigate('', { trigger: true });
    },
    'click .users': function() {
      App.router.navigate('admin/users', { trigger: true });
    },
    'click .orders': function() {
      App.router.navigate('admin/orders', { trigger: true });
    },    
    'click .pod': function() {
      App.router.navigate('admin/items/POD', { trigger: true });
    },
    
    
    'click .magazin': function() {
      App.router.navigate('admin/contents/Magazin', { trigger: true });
    },  
    'click .video': function() {
      App.router.navigate('admin/contents/Videó', { trigger: true });
    },
    'click .ujdonsag': function() {
      App.router.navigate('admin/contents/Újdonság', { trigger: true });
    },      
    

    'click .pod': function() {
      App.router.navigate('admin/items/POD', { trigger: true });
    },  
    'click .postcards': function() {
      App.router.navigate('admin/items/Képeslap', { trigger: true });
    },  
    'click .ecards': function() {
      App.router.navigate('admin/items/E-card', { trigger: true });
    },
    'click .gifts': function() {
      App.router.navigate('admin/items/Ajándéktárgy', { trigger: true });
    }      
  }
  
});

module.exports = LayoutView;
