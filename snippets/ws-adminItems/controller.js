var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:adminItems:controller');
var router = require('./router');
var LayoutView = require('./layout');

router.on('route:adminItems', function(type) {

  var adminView = App.eventReqres.request("render:admin");
  (adminView && adminView.showChildView('adminContent', new LayoutView({
    type: type
  })));    
  
});