var fs = require('fs');
var Handlebars = require('handlebars');
var $ = require('jquery');
var _ = require('underscore');

var path = require('path');
var url = require('url');
var moment = require('moment');
var format = require('util').format;
var Images = require('../../lib/images');
var Form = require('../../lib/form');

var App = require('app');
var debug = App.debugFactory('snippet:adminItemsForm:layout');
var controller = require('./controller');

var ItemModel = require('../../model/items').Model;

var ImageModel = require('../../model/images').Model;
var ImageCollection = require('../../model/images').Collection;

var TagsCollection = require('../../model/tags').Collection;
var SelectCollectionView = require('../../lib/collections/select');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

var LayoutView = App.LayoutView.extend({ 
  
  initialize: function(options) {
    this.options = options;
  },
  
  render: function() {
    debug('LayoutView render');
    
    this.options.typeName = this.options.type; 
    
    if (this.options.id) {
      this.options.header = 'POD módosítása';
      
    } else {
      this.options.header = this.options.typeName + ' hozzáadása';   
    }
    
    var online, editable;
    
    switch (this.options.type) {
      case 'POD':
        online = false;
        editable = true;
      break;
      case 'E-card':
        online = true;
        editable = false;
      break;
      case 'Képeslap':
        online = false;
        editable = false;
      break;      
      case 'Ajándéktárgy':
        online = false;
        editable = false;
      break;      
    }
    
    this.options.formDefaults = {
      type: this.options.type,
      online: online,
      editable: editable
    }
    
    this.$el.html(this.template(this.options));
  },
  
  template: Handlebars.compile(layoutTemplate),  

  ui: {
    tagsSelect: '.region-tagsSelect'
  },
  
  regions: {
    
    itemForm: {
      selector: '.region-itemForm',
      allowMissingEl: true    
    }
    
  },
  
  events: {
    'keyup input': function(e) {
      return Form.validateField(e.target);
    },
    
    'keyup textarea': function(e) {
      return Form.validateField(e.target);
    },
    
    'submit form': 'submitForm',
    
    'click .back': function() {
      App.router.navigate(format('admin/items/%s', this.options.type), { trigger: true });  
    },
    
    'click .delete': 'deleteItem'
  },
  
  deleteItem: function() {

    var id = this.options.id;
    var type = this.options.type;
  
    var itemModel = new ItemModel({
      id: id
    });            

    itemModel.destroy({
      success: function(model, response) {

        App.router.navigate(format('admin/items/%s', type), { trigger: true });  

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
          
  submitForm: function(event) {
    
    event.preventDefault();
    
    var _this = this;
    
    var type = this.$el.find('input[name="type"]').val();

    var modelData = {
      name:         $(event.target).find('[name="name"]').val(), 
      price:        $(event.target).find('[name="price"]').val(), 
      sdescription: $(event.target).find('[name="sdescription"]').val(), 
      description:  $(event.target).find('[name="description"]').val(),
      online:       $(event.target).find('[name="online"]').val(),
      editable:     $(event.target).find('[name="editable"]').val(),
      type:         type
    };
    
    if (this.model) {
      var itemModel = this.model;
      itemModel.set(modelData);    
    } else {
      var itemModel = new ItemModel(modelData);
    }
    
    //itemModel.set(modelData);
    
    // after save
    itemModel.on('sync', function(e) {
      App.router.navigate(format('admin/item/edit/%s/%d', _this.options.type, itemModel.get('_id')), { trigger: true });
    });
    
    itemModel.save(null, {
      success: function(model, response) {
        $.notify({
          message: 'Sikeres mentés!'
        }, {
          type: 'success',
          placement: {
            align: 'center'
          },
          delay: 1000,
          animate: {
              enter: 'animated fadeInDown',
              exit: 'animated fadeOutUp'
          }          
        });
      },
      error: function(model, response) {
        $.notify({
          message: 'Sikertelen mentés!'
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
  
  onBeforeDestroy: function() {
    this.selectCollectionView.destroy();
  },
  
  onBeforeShow: function() {

    /********/
    /* ITEM */ 
    /********/    
    if (this.options.id) {
      
      var _this = this;
      
      var itemModel = new ItemModel({
        id: _this.options.id
      });
      
      this.model = itemModel;
      
      itemModel.on('change', function() {
        
        for (var attr in itemModel.attributes) {
          var val = itemModel.attributes[attr];
          var $el = _this.$el.find(format('[name="%s"]', attr));
          $el.val(itemModel.attributes[attr]);
          Form.validateField($el);
          
          /*
          if (_.isArray(val)) {
            for (var k in val) {
              var type = val[k];
              
              if (_this.$el.find(format('option[value="%s"]', type))) {

                _this.$el
                  .find('.region-tagsSelect')            
                  .val(type);
                
                _this.options.type = type;
              }
              
            }
          }*/
         
        }
        
        
      });
      
      itemModel.fetch();      
    }
  },
  
  onShow: function() {
    
    /********/
    /* TAGS */ 
    /********/
    
    // Get the collection with filter setup
    var tagsCollection = new TagsCollection([], {
      type: 'item'
    });
    
    this.listenTo(tagsCollection, 'change reset add remove', function() {
      
    });
    
    this.listenTo(tagsCollection, 'sync', function(collection, items) {         
      
      this.$el
        .find('select')
        .val(this.options.type)
        .prop('disabled', true);
      
    })        

    var _this = this;
    
    // Get the collection view
    this.selectCollectionView = new SelectCollectionView({
      
      // where to render directly, without a wrapping div
      el: '.region-tagsSelect',
      
      // set the collection for the view
      collection: tagsCollection
      
    });
    
    // we have to destroy manually
    this.selectCollectionView.render();
    
    tagsCollection.fetch({
      
      error: function() {
        console.log('ERROR');
      }
      
    });    

    /***********************/
    /* Images initialize   */ 
    /***********************/       
    var $imageContainer = $('.file').eq(0);
    var $podContainer = $('.file').eq(1);

    var imageApiUrl = format('/api/items/%d/images', _this.options.id);     
    var imagePubUrl = '/item-images/' + _this.options.id;

    var podApiUrl = format('/api/items/%d/pods', _this.options.id);     
    var podPubUrl = '/item-pods/' + _this.options.id;
    
    var imageManager = new Images({
      $container: $imageContainer, 
      apiUrl: imageApiUrl, 
      pubUrl: imagePubUrl
    });
    
    var podManager = new Images({
      $container: $podContainer, 
      apiUrl: podApiUrl, 
      pubUrl: podPubUrl
    });

    /*****************/
    /* Image upload  */ 
    /*****************/   
    imageManager.initUpload();
    podManager.initUpload();

    /*******************/
    /* Image deleting  */ 
    /*******************/    
    
    var handleImageDelete = function($container, apiUrl) {
      
      $container.on('deleteImage', function(event, image, $target) {

        var imageModel = new (App.Backbone.Model.extend({

          urlRoot: apiUrl

        }))({

          id: $target.data('filename')

        });            

        imageModel.destroy({
          success: function(model, response) {

            $target.trigger('deleted');

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

      });
    
    }
    
    handleImageDelete($imageContainer, imageApiUrl);
    handleImageDelete($podContainer, podApiUrl);

    /*******************/
    /* Load images     */ 
    /*******************/    
    
    if (_this.options.id) {

      // Images
      var imagesCollection = new ImageCollection([], {
        url: imageApiUrl
      });

      imagesCollection.fetch({
        error: function() {
          console.log('ERROR');
        },
        success: function(collection, response, options) {        
          imageManager.loadCollectionImages(response);
        }
      });  

      // Pods     
      var podsCollection = new ImageCollection([], {
        url: podApiUrl
      });

      podsCollection.fetch({
        error: function() {
          console.log('ERROR');
        },
        success: function(collection, response, options) {        
          podManager.loadCollectionImages(response);
        }
      });  
      
    }

        
  }
  
});

module.exports = {
  Layout: LayoutView
};
