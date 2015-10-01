var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:adminContents:controller');
var router = require('./router');
var LayoutView = require('./layout').Layout;
var ItemModel = require('../../model/contents').Model;
var format = require('util').format;

router.on('route:adminContentsFormAdd', function(type) {
  
  var modelData = {
    hidden: true
  }
  
  var itemModel = new ItemModel(modelData);

  // after save
  itemModel.on('sync', function(e) {
    App.router.navigate(format('admin/content/edit/%s/%d', type, itemModel.get('_id')), { trigger: true });
  });

  itemModel.save(null, {
    success: function(model, response) {

    },
    error: function(model, response) {

    }      
  });
    
});

router.on('route:adminContentsFormEdit', function(type, id) {
  
  var adminView = App.eventReqres.request("render:admin");
  (adminView && adminView.showChildView('adminContent', new LayoutView({ 
    type: type,
    id: id
  })));  
  
});