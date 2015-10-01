var Sortable = require('sortablejs');
var q = require('q');
var loadImage = require('load-image');
var format = require('util').format;
var path = require('path');
var $ = require('jquery');
var _ = require('underscore');
require('fancybox')($);

var images = function(options) {
  
  options = _.extend({
    $container: null,
    apiUrl: null,
    pubUrl: null,
    model: null
  }, options);

  var _this = this;

  var $deleteIcon = $('<i/>')
      .addClass('fa fa-trash fa-2x')
      .on('click', function () {

        $target = $(this).parent();
        $icon = $(this);
        
        $target.one('deleted', function() {
          $target.remove();
          $icon.remove();

          _this.reorderCanvases();          
        });
        
        options.$container.trigger('deleteImage', [$target.data('filename'), $target]);          

      }); 
  
  this.loadItemImage = function() {

    if ((images = options.model.get('images')).length) {

      imageUrl = format('/item-images/%d/thumb-crop/%s', options.model.get('_id'), images[0]);
      
      return loadImage(imageUrl);
      
    } else {
      return q(false);
    }
  
  },
    
  this.loadCollectionImages = function(response) {
    
    var loadAllImages = [];
    var i = 0;

    // Load the images in collection
    $(response).each(function() {
      
      var imageName = this + '';

      var imagePath = path.join(options.pubUrl, imageName);

      var node = $('<div>')
        .addClass('preview')
        .appendTo(options.$container.find('.image-placeholder').eq(i++));

      loadAllImages.push(loadImage(
        imagePath,
        function (loadedImg) {

          node
            .append(loadedImg)
            .append($deleteIcon.clone(true))
            .attr('data-filename', path.basename(imagePath))
            .attr('data-original', path.basename(imagePath));

        }, {
          maxWidth: 300,
          maxHeight: 300,
          canvas: true,
          crop: true
        }
      ));          

    });

    // Make it sortable
    q.all(loadAllImages)
      .then(_this.sortableImages);
  }
  
  this.sortableImages = function() {

    return Sortable.create(options.$container.find('.sortable').get(0), {
      ghostClass: 'ghost',
      onUpdate: _this.saveImageOrder
    });

  }  
  
  this.saveImageOrder = function() {
    q(_this.getImageNamesInOrder())
      .then(_this.saveImageOrderRequest);
  }  
  
  this.getImageNamesInOrder = function() {

    var images = [];
    var filename;

    options.$container.find('.sortable').children().each(function() {
      (filename = $(this).find('.preview').data('filename')) && images.push(filename);
    });

    return images;
  }  
  
  this.saveImageOrderRequest = function(images) {

    $.ajax({
      url: options.apiUrl, 
      type: 'PUT',
      data: { 
        images: JSON.stringify(images)
      },
      success: function() {

      },
      error: function() {

      },
      dataType: 'json'
    });

  }  
  
  this.reorderCanvases = function() {
    var $previews = options.$container.find('.preview').detach();
    var i = 0;
    $previews.each(function() {
      options.$container.find('.image-placeholder').eq(i++).append(this);
    });
  }  

  this.initUpload = function() {

    options.$container.find('input[type="file"]').fileupload({
        url: options.apiUrl,
        dataType: 'json',
        autoUpload: true,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxFileSize: 999000,
        // Enable image resizing, except for Android and Opera,
        // which actually support image resizing, but fail to
        // send Blob objects via XHR requests:
        disableImageResize: /Android(?!.*Chrome)|Opera/
          .test(window.navigator.userAgent),
        previewMaxWidth: 150,
        previewMaxHeight: 150,
        previewCrop: true

    }).on('fileuploadprocessalways', function (e, data) {

        var index = options.$container.find('canvas').length;
        var file = data.files[0];
        var imageContainer = $('<div>')
          .addClass('preview')
          .appendTo(options.$container.find('.image-placeholder').eq(index));

        // canvas
        if (file.preview) {
          imageContainer
            .append(file.preview)
            .append($deleteIcon.clone(true))
            .attr('data-original', file.name);     
        }

        if (file.error) {
          imageContainer
            .append('<br>')
            .append($('<span class="text-danger"/>').text(file.error));
        }

    }).on('fileuploadstart', function(e, data) {
      options.$container.find('.progress').slideDown();

    }).on('fileuploadprogressall', function (e, data) {

        var progress = parseInt(data.loaded / data.total * 100, 10);
        options.$container.find('.progress-bar').css(
            'width',
            progress + '%'
        );

    }).on('fileuploaddone', function (e, data) {

        options.$container.find('.progress').hide();

        $.each(data.result.files, function (index, file) {

            var $preview = $(format('.preview[data-original="%s"]', file.originalName));
            $preview.attr('data-filename', file.name);

            //$uploadedCanvas.wrap(format('<a href="%s" title="%s"></a>', file.url, file.originalName));

            //$uploadedCanvas.parent('a').fancybox();

            //var $bigImage = $(format('<a href="%s" class="fancybox" title="%s"><img src="%s" /></a>', file.url, file.originalName, file.url));

            if (file.url) {

                var link = $('<a>')
                    .attr('target', '_blank')
                    .prop('href', file.url);

                /*
                $(data.context.children()[index])
                    .wrap(link);*/

            } else if (file.error) {
                var error = $('<span class="text-danger"/>').text(file.error);
                $(data.context.children()[index])
                    .append('<br>')
                    .append(error);
            }
        });

    }).on('fileuploadfail', function (e, data) {
        $.each(data.files, function (index) {
            var error = $('<span class="text-danger"/>').text('File upload failed.');
            $(data.context.children()[index])
                .append('<br>')
                .append(error);
        });
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');    

  }

}

module.exports = images;