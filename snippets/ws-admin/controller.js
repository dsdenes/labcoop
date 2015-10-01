var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:admin:controller');
var router = require('./router');
var LayoutView = require('./layout');
var auth = require('../../lib/auth');

App.eventReqres.setHandler("render:admin" , function(){
  return new LayoutView();
});     

var adminLayout = new LayoutView(); 

router.on('route:admin', function() { 
    
  auth.isAdmin()
    .then(function() {
      debug('Logged in');
      App.layout.showChildView('container', new LayoutView());
    
    }, function() {
      debug('Not logged in');
      
      var LoginView = App.eventReqres.request("render:login");   
      (LoginView && App.layout.showChildView('content', new LoginView()));

    });
  // render to the main content part
  
  /*
  var itemCollection = new (require('collection/items'))();
  
  itemCollection.add({
    name: 'Uj kepeslap',
    description: 'Uj kepeslap leirasa',
    price: 22
  });
  
  debug(JSON.stringify(itemCollection));*/
  
  
});

module.exports = router;
