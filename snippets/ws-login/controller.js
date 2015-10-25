var App = require('app');
var router = require('./router');
var LayoutView = require('./layout');

router.on('route:login', function(where) {
  
  // render to the main content part
  App.layout.showChildView('content', new LayoutView({
    where: where
  }));
  
  /*
  var itemCollection = new (require('collection/items'))();
  
  itemCollection.add({
    name: 'Uj kepeslap',
    description: 'Uj kepeslap leirasa',
    price: 22
  });
  
  debug(JSON.stringify(itemCollection));*/
  
  
});