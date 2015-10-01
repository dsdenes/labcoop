var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:adminUsers:controller');
var router = require('./router');
var LayoutView = require('./layout');

router.on('route:adminUsers', function() {

  var adminView = App.eventReqres.request("render:admin");
  (adminView && adminView.showChildView('adminContent', new LayoutView()));  
  
});