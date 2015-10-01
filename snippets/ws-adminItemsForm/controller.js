var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:adminItems:controller');
var router = require('./router');
var LayoutView = require('./layout').Layout;
var ItemModel = require('../../model/items').Model;
var format = require('util').format;

router.on('route:adminItemsFormAdd', function(type) {
  
  var modelData = {
    hidden: true
  }
  
  var itemModel = new ItemModel(modelData);

  // after save
  itemModel.on('sync', function(e) {
    App.router.navigate(format('admin/item/edit/%s/%d', type, itemModel.get('_id')), { trigger: true });
  });

  itemModel.save(null, {
    success: function(model, response) {

    },
    error: function(model, response) {

    }      
  });
  
  /*
  var adminView = App.eventReqres.request("render:admin");
  (adminView && adminView.showChildView('adminContent', new LayoutView({ 
    type: type
  })));*/  
    
});

router.on('route:adminItemsFormEdit', function(type, id) {
  
  var adminView = App.eventReqres.request("render:admin");
  (adminView && adminView.showChildView('adminContent', new LayoutView({ 
    type: type,
    id: id
  })));  
  
});