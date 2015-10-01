var path = require('path');
var App = require('app');
var fs = require('fs');
var format = require('util').format;

var Handlebars = require('handlebars');
var _ = require('underscore');
var co = require('co');
var Images = require('../../lib/images');

var debug = App.debugFactory('snippet:contents-list:layout');

var ItemCollection = require('../../model/contents').Collection;
var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
var itemTemplate = fs.readFileSync(path.join(__dirname, 'model.html'), 'utf8');
//var itemCollectionTemplate = fs.readFileSync(path.join(__dirname, 'collection.html'), 'utf8');

var LayoutView = App.LayoutView.extend({   
  
  id: 'ws-result',

  initialize: function(options) {    
    this.options.query = JSON.parse(options.query);
  },
  
  render: function() {
    debug('LayoutView render');
    this.$el.html(this.template(this.options));
  },
  
  regions: {  
    
    'filterbox': {
      selector: '.region-filterbox',
      allowMissingEl: true
    }
    
  },    
  
  events: {

  },
  
  template: Handlebars.compile(layoutTemplate),
  
  onShow: function() {
    
    var _this = this;
    
    this.renderNested({
      query: _this.options.query
    });
    
    /*
    this.itemCollectionRegular = new ItemCollection();
    
    var itemCollectionViewHightlighted = new ItemCollectionView({
      el: '.items-hightlighted',
      collection: this.itemCollectionHightlighted,
      type: this.options.type,
      childViewOptions: {
        className: 'col-md-6'
      }
    });
    
    var itemCollectionViewRegular = new ItemCollectionView({
      el: '.items-regular',
      collection: this.itemCollectionRegular,
      type: this.options.type,
      childViewOptions: {
        className: 'col-md-3'
      }
    });    
    
    itemCollectionViewHightlighted.render();
    itemCollectionViewRegular.render();
    
    // REGULAR: fetch by tag
    co(function*() {

      var filterTags = [_this.options.type];

      var items = yield $.ajax(format('/api/contents/bytag/%s', JSON.stringify(filterTags)));   
      
      if (!items.length) {

        //_this.ui.loading.hide();  
        //_this.ui.table.hide();
        //_this.ui.empty.show();

        return;      
      } 

      _this.itemCollectionRegular.reset(items);

    }).catch(function(error) {
      debug(error);
    });       
    */
    //this.itemCollectionRegular.fetch();
        
  },
  
  onBeforeDestroy: function() {

  }
  
});

var ItemView = App.Backbone.Marionette.ItemView.extend({
  
  tagName: 'div',
  
  className: function() {
    return this.options.className;
  },
  
  template: Handlebars.compile(itemTemplate),

  initialize: function(options) {
    this.options = options;
  },
  
  serializeData: function() {   
    
    var attribs = _.extend(this.model.attributes, {

    });
    
    if (this.model.attributes.images.length) {
      //attribs.image = format('/item-images/%d/%s', this.model.attributes._id, this.model.attributes.images[0]);
    }
    
    return attribs;
  },
  
  events: {
    'click .addbasket': 'addBasket'
  },
  
  onRender: function(item) {

    var imageManager = new Images({
      model: item.model
    });    

    //var loadedImage = imageManager.loadItemImage();

    /*
    item.$el.find('.itemInner')
      .prepend(loadedImage); */
    
  },
  
  addBasket: function() {
    App.commands.execute('addBasket', this.model);
  }
  
});

var ItemEmptyView = App.Backbone.Marionette.ItemView.extend({
  template: '<div>NINCS SEMMI</div>' 
});

var ItemCollectionView = App.Backbone.Marionette.CollectionView.extend({

  childView: ItemView,
  emtpyView: ItemEmptyView
  
});

module.exports = LayoutView;
