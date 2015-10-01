var path = require('path');
var App = require('app');
var fs = require('fs');
var format = require('util').format;

var Handlebars = require('handlebars');
var _ = require('underscore');
var str = require('underscore.string');
var co = require('co');
var Images = require('../../lib/images');

var debug = App.debugFactory('snippet:postcards-list:layout');

var ItemCollection = require('../../model/jobs').Collection;
var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
var itemTemplate = fs.readFileSync(path.join(__dirname, 'model.html'), 'utf8');
//var itemCollectionTemplate = fs.readFileSync(path.join(__dirname, 'collection.html'), 'utf8');
var sanitize = require('sanitize-html');

App.eventReqres.setHandler("render:joblist" , function(options){
  return LayoutView;
});

var LayoutView = App.LayoutView.extend({   

  id: 'ws-jobs-list',
  
  initialize: function(options) {
    this.options = options;
  },
  
  render: function() {
    debug('LayoutView render');
    this.$el.html(this.template(this.options));
  },
  
  regions: {  
  
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
    //this.options.filters && this.setFilters(this.options.filters); 
    
    //this.renderNested();
    
    this.itemCollection = new ItemCollection();
    
    var itemCollectionView = new ItemCollectionView({
      collection: this.itemCollection
    })
    
    // .region-items
    itemCollectionView.render();

    App.eventReqres.setHandler('filterCount', function() {

      var filterText = App.eventReqres.request('value:filterText');      
      var filterTags = App.eventReqres.request('value:filterTags');
      
      return $.ajax(format('/api/items/filtercount/%s/%s', filterText, JSON.stringify(filterTags)));
      
    });
    
    App.commands.setHandler('showJobs', function(ids) {

      co(function*() {
      
        /*
        var filters = {
          text: App.eventReqres.request('value:filterText'),
          tags: App.eventReqres.request('value:filterTags')
        }*/
        
        var items = yield $.ajax(format('/api/jobs/byids/%s', JSON.stringify(ids)));  

        _this.itemCollection.reset(items);
        //itemCollectionView.render();
        
        //_this.setFilterUrl(filters);
        
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
    //App.commands.removeHandler('filterCount');
    App.commands.removeHandler('showJobs');
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
  
  initialize: function(options) {
    this.options = options;
  },
  
  serializeData: function() {   
    
    var attribs = _.extend(this.model.attributes, {
      languageList: this.model.attributes.languages.join(', '),
      jobTitle: str.clean(sanitize(str.unescapeHTML(this.model.attributes.jobTitle))),
      description: str.clean(sanitize(str.unescapeHTML(this.model.attributes.introInformation), {
        allowedTags: []
      })),
      count: String("0" + this.options.index).slice(-2),
      applyUrl: _.unescape(this.model.attributes.applyUrl)
    });
    
    /*
    if (this.model.attributes.images.length) {
      //attribs.image = format('/item-images/%d/%s', this.model.attributes._id, this.model.attributes.images[0]);
    }*/
    
    return attribs;
  },
  
  events: {
    
  },
  
  onRender: function(item) {
    
  }
  
});

var ItemEmptyView = App.Backbone.Marionette.ItemView.extend({
  template: '<div>NINCS SEMMI</div>' 
});

var ItemCollectionView = App.Backbone.Marionette.CollectionView.extend({
  
  el: '.region-items',

  childView: ItemView,
  emtpyView: ItemEmptyView,
  childViewOptions: function(model, index) {
    return {
      index: index + 1
    };
  }
  
});

module.exports = LayoutView;
