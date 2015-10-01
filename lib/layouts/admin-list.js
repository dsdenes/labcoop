var Handlebars = require('handlebars');
var $ = require('jquery');
var _ = require('underscore');
var path = require('path');
var moment = require('moment');
var format = require('util').format;
var url = require('url');
var co = require('co');

var App = require('app');
var debug = App.debugFactory('snippet:adminContents:layout');

var loadImage = require('load-image');

module.exports = function(options) {
  
  var options = _.extend({
    loadImagesToCell: false
  }, options);

  var ItemView = App.Backbone.Marionette.ItemView.extend({

    tagName: 'tr',

    template: Handlebars.compile(options.itemTemplate),

    initialize: function(_options) {
      this.options = _options;
    },  

    serializeData: function() {
      return _.extend(this.model.attributes, {
        created: moment(this.model.get('created')).format('YYYY.MM.DD.'),
        modified: moment(this.model.get('modified')).format('YYYY.MM.DD.'),
        id: this.model.get('_id')
      })
    },

    modelEvents: {
      // TODO what is it good for?
      'change:hidden': function() {
        this.setVisibility(this.model.get('hidden'));  
      }
    },

    events: {
      'click .edit': 'navigateEdit',
      'click .delete': 'deleteItem',
      'click .disable': 'changeVisibility'
    },

    onRender: function(item) {
      
      this.setVisibility(this.model.get('hidden'));

      var images;

      if (options.loadImagesToCell !== false && (images = item.model.get('images')).length) {

        var imageUrl = format('/%s/%d/thumb-crop/%s', options.imagePath, item.model.get('_id'), images[0]);

        loadImage(imageUrl, function(loadedImg) {

          item.$el.find(format('td:eq(%d)'), options.loadImagesToCell)
            .append(loadedImg)
            .attr('data-filename', path.basename(imageUrl));

        });

      }

    },
      
    navigateEdit: function() {
      App.router.navigate(format('%s/%s/%d', options.editUrl, this.options.type, this.model.get('_id')), { trigger: true });
    },

    setVisibility: function(hidden) {

      var $visibleEl = this.$el.find('.disable');

      if (hidden) {
        $visibleEl
          .removeClass('fa-eye green')
          .addClass('fa-eye-slash')
          .addClass('red');

        $visibleEl.parents('tr')
          .css('opacity', 0.5);

      } else {
        $visibleEl
          .removeClass('fa-eye-slash red')
          .addClass('fa-eye')
          .addClass('green');    

        $visibleEl.parents('tr')
          .css('opacity', 1);
      }  

    },

    deleteItem: function(event) {

      var _this = this;

      var id = this.model.get('id');

      var itemModel = new options.model({
        id: id
      });            

      itemModel.destroy({
        success: function(model, response) {

          _this.remove();

        },
        error: function(model, response) {
          $.notify({
            message: 'Sikertelen törlés!'
          }, {
            type: 'danger',
            placement: {
              align: 'center'
            },
            delay: 5000,
            animate: {
              enter: 'animated fadeInDown',
              exit: 'animated fadeOutUp'
            }          
          });
        }      
      }); 

    },

    changeVisibility: function(event) {

      var _this = this;

      // toggle
      var newHidden = !(this.model.get('hidden'));

      var saveData = {
        hidden: newHidden
      }

      this.model.set(saveData);

      this.model.save();

    }

  });

  var EmptyView = App.Backbone.Marionette.ItemView.extend({
    template: '<div>NINCS SEMMI</div>' 
  });

  var CollectionView = App.Backbone.Marionette.CollectionView.extend({

    el: '.region-items',

    template: Handlebars.compile(options.collectionTemplate),

    initialize: function(options) {
      this.options = options;
    },    

    childView: ItemView,
    emtpyView: EmptyView,

    childViewOptions: function(model, index) {
      return {
        type: this.options.type
      }
    }

  });
  
  return App.LayoutView.extend({   

    initialize: function(_options) {
      this.options = _options;
    },

    render: function() {
      this.$el.html(this.template(this.options));
    },

    ui: {
      loading: '.loading',
      table: 'table',
      empty: '.empty'
    },

    events: {
      'click .new': 'navigateAdd'
    },

    template: Handlebars.compile(options.layoutTemplate),  

    onShow: function() {
      
      var _this = this;

      this.bindUIElements()

      this.ui.loading.fadeIn();

      var collection = new options.collection();
      
      var collectionView = new CollectionView({
        collection: collection,
        type: this.options.type
      });
            
      this.listenTo(collectionView, 'render:collection', function(collection, items) {
        
        $('.region-items').dataTable();      

        this.ui.loading.hide();      
      });  
      
      collectionView.render();
      
      // default filtering by tag
      co(function*() {

        var filterTags = [_this.options.type];
        
        var items = yield $.ajax(format('/api/%s/bytag/%s', options.apiName, JSON.stringify(filterTags)));   
        
        if (!items.length) {
          
          _this.ui.loading.hide();  
          _this.ui.table.hide();
          _this.ui.empty.show();
          
          return;      
        } 

        collection.reset(items);
        
        //_this.setFilterUrl(filters);
        
      }).catch(function(error) {
        debug(error);
      });      

      //collection.fetch();    

    },

    navigateAdd: function() {
      App.router.navigate(format('%s/%s', options.addUrl, this.options.type), { trigger: true });
    }

  });

}