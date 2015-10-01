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

require('node_modules/froala-editor/js/froala_editor.min.js');
require('node_modules/froala-editor/js/langs/hu.js');
require('node_modules/froala-editor/js/plugins/block_styles.min.js');
require('node_modules/froala-editor/js/plugins/char_counter.min.js');
require('node_modules/froala-editor/js/plugins/file_upload.min.js');
require('node_modules/froala-editor/js/plugins/fullscreen.min.js');
require('node_modules/froala-editor/js/plugins/lists.min.js');
require('node_modules/froala-editor/js/plugins/media_manager.min.js');
require('node_modules/froala-editor/js/plugins/tables.min.js');
require('node_modules/froala-editor/js/plugins/video.min.js');

//var froala = require('node_modules/froala-editor/froala_editor.min.js');

var App = require('app');
var debug = App.debugFactory('snippet:adminContentsForm:layout');
var controller = require('./controller');

var ItemModel = require('../../model/contents').Model;

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
    
    /*
    this.options.typeName = this.options.type; 
    
    if (this.options.id) {
      this.options.header = 'Tartalom módosítása';
      
    } else {
      this.options.header = this.options.typeName + ' hozzáadása';   
    }*/
    
    this.options.formDefaults = {
      type: this.options.type
    }
    
    this.$el.html(this.template(this.options));
  },
  
  template: Handlebars.compile(layoutTemplate),  

  ui: {
    editable: 'textarea.editable'
    //tagsSelect: '.region-tagsSelect'
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
      App.router.navigate(format('admin/contents/%s', this.options.type), { trigger: true });  
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

        App.router.navigate(format('admin/contents/%s', type), { trigger: true });  

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
    
    var _this = this
    
    var type = this.$el.find('input[name="type"]').val();

    var modelData = {
      title:  $(event.target).find('[name="title"]').val(), 
      lead:   $(event.target).find('[name="lead"]').val(), 
      text:   this.getEditorContent(),
      type:   type
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
      App.router.navigate(format('admin/content/edit/%s/%d', _this.options.type, itemModel.get('_id')), { trigger: true });
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
        }
        
        _this.setEditorContent(_this.model.get('text'));
        
      });
      
      itemModel.fetch();      
    }
  },
  
  onShow: function() {
    
    var _this = this;
    
    this.bindUIElements();
    
    this.ui.editable.editable({
      inlineMode: false,
      buttons: ['formatBlock', 'removeFormat', 'bold', 'italic', 'sep', 'indent', 'outdent', 'insertOrderedList', 'insertUnorderedList', 'table', 'sep', 'createLink', 'insertImage', 'insertVideo', 'uploadFile', 'sep', 'undo', 'redo', 'fullscreen'],
      language: 'hu',
      fileUploadURL: format('/api/contents/%s/files/upload', _this.options.id),
      imagesLoadURL: format('/api/contents/media-manager/list', _this.options.id),
      imageUploadURL: format('/api/contents/%s/images', _this.options.id),
      imageDeleteConfirmation: false,
      imageButtons: ['display', 'align', 'linkImage', 'removeImage'],
      imageResize: true,
      mediaManager: true,
      minHeight: 300,
      plainPaste: true,
      spellcheck: true
    }).on('editable.afterRemoveImage', function(e, editor, $img) {
      
      var fileName = $img.attr('src').split('/').pop();

      $.ajax({
        url: format('/api/contents/%s/images/%s', _this.options.id, fileName),
        type: 'DELETE',
        success: function(result) {
          
        },
        error: function(result) {
          
        } 
      });
      
    }).on('editable.imageResizeEnd', function(e, editor, $img) {
      
      var viewWidth = _this.$el.find('.froala-view').width();
      var imageWidth = $img.width();
      
      if (viewWidth === imageWidth) {
        $img.addClass('fullWidth');
      } else {
        $img.removeClass('fullWidth');      
      }

    });
    
    /********/
    /* TAGS */ 
    /********/
    
    // Get the collection with filter setup
    var tagsCollection = new TagsCollection([], {
      type: 'content'
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
    //var $podContainer = $('.file').eq(1);

    var imageApiUrl = format('/api/contents/%d/galleries', _this.options.id);     
    var imagePubUrl = '/content-galleries/' + _this.options.id;
    
    var imageManager = new Images({
      $container: $imageContainer, 
      apiUrl: imageApiUrl, 
      pubUrl: imagePubUrl
    });
    
    /*
    var podManager = new Images({
      $container: $podContainer, 
      apiUrl: podApiUrl, 
      pubUrl: podPubUrl
    });*/

    /*****************/
    /* Image upload  */ 
    /*****************/   
    imageManager.initUpload();
    //podManager.initUpload();

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
    //handleImageDelete($podContainer, podApiUrl);

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
      /*
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
      }); */ 
      
    }

        
  },
  
  setEditorContent: function(value) {
    this.ui.editable.editable('setHTML', value);
  },
  
  getEditorContent: function() {
    return this.ui.editable.val();
  },
  
  toggleFullWidth: function(event) {
    console.log(event.target);
  }
  
});

module.exports = {
  Layout: LayoutView
};
