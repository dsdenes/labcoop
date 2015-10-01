var path = require('path');

var App = require('app');
App.Backbone.LocalStorage = require("backbone.localstorage");

var fs = require('fs');
var Handlebars = require('handlebars');
var debug = App.debugFactory('snippet:basketLeft:layout');
var _ = require('underscore');
var format = require('util').format;

var co = require('co');
var Images = require('../../lib/images');
//require('localstorage.cdn');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
var ItemCollection = require('../../model/items').Collection;
var itemTemplate = fs.readFileSync(path.join(__dirname, 'model.html'), 'utf8');

var Images = require('../../lib/images');

var $ = require('jquery');

App.eventReqres.setHandler("render:basketLeft" , function(options){
  return LayoutView;
});

var LayoutView = App.LayoutView.extend({   
  
  tagName: 'div',  
  id: 'ws-basketLeft',
  
  initialize: function(options) {
    this.options = options;
  },
  
  render: function() {
    this.$el.html(this.template(this.options));
  },
  
  ui: {
    sum: '.sum',
    totalPrice: '.totalPrice'
  },
  
  template: Handlebars.compile(layoutTemplate),
  
  onBeforeDestroy: function() {
    this.basketCollectionView.destroy();
  },
  
  onShow: function() {

    this.bindUIElements();
    this.renderNested();

    var basketCollection = new (App.Backbone.Collection.extend({

      localStorage: new App.Backbone.LocalStorage("basketItems")

    }));
    
    this.listenTo(basketCollection, 'update', this.updatePrice);
    
    // Get the collection view
    this.basketCollectionView = new ItemCollectionView({
      
      // where to render directly, without a wrapping div
      el: '.basketContent',
      
      // set the collection for the view
      collection: basketCollection
      
    });
    
    this.basketCollectionView.render();    
    
    basketCollection.fetch({
      
      error: function() {
        console.log('ERROR');
      },
      
      success: function() {
        
      }
      
    });
    
    App.commands.setHandler('addBasket', function(itemModel) {
      
      if (basketCollection.where({ _id: itemModel.get('_id') }).length) {
        return;
      }
      
      itemModel.collection = basketCollection;        
      basketCollection.add(itemModel.clone());
      itemModel.save();
    });
    
  },
  
  onBeforeDestroy: function() {
    App.commands.removeHandler('addBasket');
  },
  
  showView: function() {
    this.$el.show();
  },
  
  hideView: function() {
    this.$el.hide();
  },
  
  updatePrice: function(collection) {
    
    if (collection.length) {
      this.showView();

      var total = 0;
      
      collection.each(function(model) {
        total+= parseInt(model.get('price'));  
      });

      //this.ui.sum.show();
      this.ui.totalPrice.html(total.toLocaleString('hu-HU') + ' Ft')    

    } else {
      this.hideView();
    }
    
  }
  
});

var ItemView = App.Backbone.Marionette.ItemView.extend({
  
  tagName: 'div',
  
  className: 'basketRow',
  
  template: Handlebars.compile(itemTemplate),
  
  events: {
    'click i': 'deleteItem'
  },
  
  serializeData: function() {   
    
    var attribs = _.extend(this.model.attributes, {
      priceNice: parseInt(this.model.get('price')).toLocaleString('hu-HU') + ' Ft'
    });
    
    if (this.model.attributes.images.length) {
      //attribs.image =   format('/item-images/%d/%s', this.model.attributes._id, this.model.attributes.images[0]);
    }
    
    return attribs;
  },
  
  onRender: function(item) {
    
    var imageManager = new Images({
      model: item.model
    });    

    var loadedImage = imageManager.loadItemImage();
    
    //console.log(loadedImage);
  
  },
  
  deleteItem: function() {
    this.model.destroy();
  }

});

var ItemEmptyView = App.Backbone.Marionette.ItemView.extend({
  template: '<div>NINCS SEMMI</div>' 
});

var ItemCollectionView = App.Backbone.Marionette.CollectionView.extend({
  
  el: '.basketContent',

  childView: ItemView,
  emtpyView: ItemEmptyView
  
});

module.exports = LayoutView;
