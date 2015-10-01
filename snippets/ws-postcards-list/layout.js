var path = require('path');
var App = require('app');
var fs = require('fs');
var format = require('util').format;

var Handlebars = require('handlebars');
var _ = require('underscore');
var co = require('co');
var Images = require('../../lib/images');

var debug = App.debugFactory('snippet:postcards-list:layout');

var ItemCollection = require('../../model/items').Collection;
var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
var itemTemplate = fs.readFileSync(path.join(__dirname, 'model.html'), 'utf8');
//var itemCollectionTemplate = fs.readFileSync(path.join(__dirname, 'collection.html'), 'utf8');

var LayoutView = App.LayoutView.extend({   

  id: 'ws-postcards-list',
  
  initialize: function(options) {
    this.options = options;
  },
  
  render: function() {
    debug('LayoutView render');
    this.$el.html(this.template(this.options));
  },
  
  regions: {  
    
    'bannerHero': {
      selector: '.region-bannerHero',
      allowMissingEl: true
    },
    
    'basketLeft': {
      selector: '.region-basketLeft',
      allowMissingEl: true
    },

    'searchLeft': {
      selector: '.region-searchLeft',
      allowMissingEl: true
    },

    'catSelectorLeft': {
      selector: '.region-catSelectorLeft',
      allowMissingEl: true
    },    
  
    'items': {
      selector: '.region-items',
      allowMissingEl: true
    }  
    
  },    
  
  events: {

  },
  
  template: Handlebars.compile(layoutTemplate),
  
  onShow: function() {
    
    var _this = this;
    
    // filters from URL
    this.options.filters && this.setFilters(this.options.filters); 
    
    this.renderNested({
      site: 'postcards-index'
    });
    
    this.itemCollection = new ItemCollection();
    
    var itemCollectionView = new ItemCollectionView({
      collection: this.itemCollection
    })
    
    // .region-items
    itemCollectionView.render();
    
    this.itemCollection.fetch({
      
      error: function() {
        console.log('ERROR');
      }, 
      
      success: function() {
      
      }
      
    });

    App.eventReqres.setHandler('filterCount', function() {

      var filterText = App.eventReqres.request('value:filterText');      
      var filterTags = App.eventReqres.request('value:filterTags');
      
      return $.ajax(format('/api/items/filtercount/%s/%s', filterText, JSON.stringify(filterTags)));
      
    });
    
    App.commands.setHandler('filter', function() {

      co(function*() {
      
        var filters = {
          text: App.eventReqres.request('value:filterText'),
          tags: App.eventReqres.request('value:filterTags')
        }
        
        if (filters.text) {
          var items = yield $.ajax(format('/api/items/filter/%s/%s', filters.text, JSON.stringify(filters.tags)));  
          
        } else {
          var items = yield $.ajax(format('/api/items/bytag/%s', JSON.stringify(filters.tags)));                
        }

        _this.itemCollection.reset(items);
        //itemCollectionView.render();
        
        _this.setFilterUrl(filters);
        
      }).catch(function(error) {
        debug(error);
      });
            
    });
    
    /*
    App.commands.setHandler('searchName', function(searchVal) {

      itemCollectionView.filter = function(child, index, collection) {
        var name = child.get('name');        
        var regex = new RegExp(searchVal, 'i');
        
        return name ? name.match(regex) : false;
      }
      
      itemCollectionView.render();
      
    });
    */
        
  },
  
  onBeforeDestroy: function() {
    App.commands.removeHandler('filterCount');
    App.commands.removeHandler('filter');
  },
  
  setFilterUrl: function(filters) {
    App.router.navigate(format('kepeslapok/%s', btoa(JSON.stringify(filters))));
  },
  
  setFilters: function(filters) {
    filters.tags && App.commands.execute('setTagFilters', filters.tags);
    filters.text && App.commands.execute('setSearchText', filters.text);
  }
  
});

var ItemView = App.Backbone.Marionette.ItemView.extend({
  
  tagName: 'div',
  template: Handlebars.compile(itemTemplate),
  
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

    var loadedImage = imageManager.loadItemImage();

    item.$el.find('.itemInner')
      .prepend(loadedImage);    
    
  },
  
  addBasket: function() {
    App.commands.execute('addBasket', this.model);
  }
  
});

var ItemEmptyView = App.Backbone.Marionette.ItemView.extend({
  template: '<div>NINCS SEMMI</div>' 
});

var ItemCollectionView = App.Backbone.Marionette.CollectionView.extend({
  
  el: '.region-items',

  childView: ItemView,
  emtpyView: ItemEmptyView
  
});

module.exports = LayoutView;
