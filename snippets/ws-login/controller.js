var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:postcards-index:controller');
var router = require('./router');
var LayoutView = require('./layout');

router.on('route:login', function() {
  
  // render to the main content part
  App.layout.showChildView('content', new LayoutView());
  
  /*
  var itemCollection = new (require('collection/items'))();
  
  itemCollection.add({
    name: 'Uj kepeslap',
    description: 'Uj kepeslap leirasa',
    price: 22
  });
  
  debug(JSON.stringify(itemCollection));*/
  
  
});