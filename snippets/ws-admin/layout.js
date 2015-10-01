var path = require('path');
var App = require('app');
var fs = require('fs');

var Handlebars = require('handlebars');
var debug = App.debugFactory('snippetadmin:layout');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
var LayoutView = App.LayoutView.extend({   
  
  id: 'ws-admin',
  
  className: 'container',
  
  template: Handlebars.compile(layoutTemplate),
  
  onRender: function() {
    debug('render');  
    var _this = this;
    
    // has to be unblocking 
    setTimeout(function() {
      _this.renderNested();
    }, 0);
    
  },
  
  regions: {
    
    adminMenu: {
      selector: '.region-adminMenu',
      allowMissingEl: true    
    },
    
    adminContent: {
      selector: '.region-adminContent',
      allowMissingEl: true      
    }
  },
  
  showChildView: function(regionName, view) {
    
    // is the admin already rendered?
    var isAdmin = !!(App.layout.container.currentView && App.layout.container.currentView.getRegion('adminContent'));
    
    // get the already rendered instance
    if (isAdmin) {
      
      var adminView = App.layout.container.currentView;
      return adminView.getRegion(regionName).show(view);
    
    // render me, and if its ok, render the element
    } else {
      
      /*
      this.once('show', function() {
        this.getRegion(regionName).show(view);
      });*/ 
      
      var requestHandler = function() {
        App.eventReqres.removeHandler(requestHandler);
        return view;
      }

      // register this instance for one time if some requests a content
      App.eventReqres.setHandler("render:adminContent", requestHandler);

      // render 
      App.layout.showChildView('container', this);
      
    }
  }
  
});

module.exports = LayoutView;
