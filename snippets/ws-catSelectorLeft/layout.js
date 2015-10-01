var path = require('path');
var App = require('app');
var fs = require('fs');
var format = require('util').format;

var Handlebars = require('handlebars');
var debug = App.debugFactory('snippet:catSelectorLeft:layout');

var TagsCollection = require('../../model/tags').Collection;
var UlCollectionView = require('../../lib/collections/ul-checkbox');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

var $ = require('jquery');

App.eventReqres.setHandler("render:catSelectorLeft" , function(options){
  return LayoutView;
});

var LayoutView = App.LayoutView.extend({   
  
  tagName: 'div',
  
  id: 'ws-catSelectorLeft',
  
  initialize: function(options) {
    this.options = options;
  },
  
  render: function() {
    this.$el.html(this.template(this.options));
  },
  
  template: Handlebars.compile(layoutTemplate),
  
  events: {
    'click input': 'filter'
  },
  
  onShow: function() {
    //this.bindUIElements();
    //debug('render');
    //this.renderNested();
    
    var _this = this;
    
    //var checkedEvent = 'setChecked:catSelectorLeft';
    
    App.eventReqres.setHandler("value:filterTags" , function(){
      
      var tags = _this.collectAllFilters();
      
      var filterTags = Object.keys(tags).filter(function(tag) {
        return (tags[tag]);
      });
      
      return filterTags;
      
    });    
    
    var tagsCollection = new TagsCollection([], {
      type: 'item'
    });
    
    // Get the collection view
    this.ulCollectionView = new UlCollectionView({
      
      // where to render directly, without a wrapping div
      el: '.tagsList',
      
      // set the collection for the view
      collection: tagsCollection
      
      //checkedEvent: checkedEvent
      
    });
    
    App.commands.setHandler('setTagFilters', function(tags) {
      
      //console.log(_this.ulCollectionView);
      _this.ulCollectionView.setChecked(tags);
      
      //App.commands.execute(checkedEvent, tags);

    });        
    
    this.listenTo(this.ulCollectionView, 'render:collection', function() {
      this.filter();  
    });

    // we have to destroy manually
    //this.ulCollectionView.render();

    tagsCollection.fetch().done(function() {
      _this.ulCollectionView.render();
      //console.log(_this.ulCollectionView.collection.length);
    
    });       
    
  },
  
  onBeforeDestroy: function() {
    this.ulCollectionView.destroy();
  },
  
  filter: function(event) {
    App.commands.execute('filter');
  },
  
  collectAllFilters: function() {
    
    var tagFilters = {};

    this.$el.find('.catrow').each(function() {
      var checked = $(this).find('input').is(':checked');
      var tag = $(this).find('label').html();

      tagFilters[tag] = checked;
    });

    return tagFilters;    
    
  }
  
});

module.exports = LayoutView;
