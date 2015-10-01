var path = require('path');
var UploadHandler = require('../../../node_modules/jquery-file-upload-middleware/lib/uploadhandler');
var shortid = require('shortid');
var execSync = require('child_process').execSync;
var im = require('imagemagick');
var co = require('co');
var q = require('q');
var _ = require('underscore');
var os = require("os");
var EventEmitter = require('events').EventEmitter;
var util = require('util'); 
var format = require('util').format;

var UploadImage = function(req, res, next, options) {
  
  var _this = this;

  options = _.extend({
    imagesHash: 'images'
  }, options);  

  var id = req.params.id;
  
  var uploadDir = path.join(options.baseDir, id);
  var uploadUrl = '/' + path.basename(options.baseDir) + '/' + id;
    
  try {
    
    var filename;
    
    var handleBegin = function(fileInfo) {      
      var extname = path.extname(fileInfo.originalName);
      filename = fileInfo.name = format('%d-%s%s', Date.now(), shortid.generate(), extname);  
      upload.removeListener('begin', handleBegin);
    }
    
    var processUploaded = function() {

        var setParam = {};
        setParam[options.imagesHash] = filename;
      
      var updateData = {
        modified: new Date(),
        $addToSet: setParam
      };
      
      return co(function* () {
        
        var uploadedFile = path.join(process.cwd(), uploadDir, filename);
        var croppedDir = path.join(process.cwd(), uploadDir, 'thumb-crop');
        execSync(format('mkdir -p %s', croppedDir));
        var croppedFile = path.join(croppedDir, filename);
        
        yield q.ninvoke(im, 'crop', {
          srcPath: uploadedFile,
          dstPath: croppedFile,
          width: 300,
          height: 300
        });
        
        yield q.ninvoke(options.Model, 'update', { _id: id }, updateData);
        
      }).catch(function(error) {
        throw error;
      });    
            
    }
    
    var _options = {
      tmpDir: os.tmpdir(),
      maxPostSize: 11000000000, // 11 GB
      minFileSize: 1,
      maxFileSize: 10000000000, // 10 GB
      acceptFileTypes: /.+/i,
      imageTypes: /\.(gif|jpe?g|png)$/i,
      imageVersions: {},
      accessControl: {
          allowOrigin: '*',
          allowMethods: 'POST'
      },
      uploadDir: function() {
        return uploadDir;
      },
      uploadUrl: function() {
        return uploadUrl;
      }
    };    
    
    var uploadHandler = UploadHandler(_options);
    
    var upload = new uploadHandler(req, res, function(result, redirect) {

      co(function* () {
        
        yield processUploaded();
        
        // special handler for the result
        if (_this.listeners('end').length) {
          _this.emit('end', result, req, res);

        // default handler
        } else {
          res.json(result);
        }  
        
      }).catch(function(error) {
        res.status(500).send(response.error(error.message));
      });
      
    });
  
    upload.on('begin', handleBegin);  
    
    //upload.on('end', handleEnd);    
    
    upload.post();
  
  } catch (error) {
    
    upload.removeListener('begin', handleBegin);
    upload.removeListener('end', handleEnd);
    
    res.status(500).send(error);
  }
  
  return this;
  
}  

util.inherits(UploadImage, EventEmitter);

var DeleteImage = function(req, res, next, options) {
  
  var id = req.params.id;
  var image = req.params.image;
  
  options = _.extend({
    imagesHash: 'images'
  }, options);  

  var uploadDir = path.join(process.cwd(), options.baseDir, id);

  var filePath = path.join(uploadDir, image);
  var thumbPath = path.join(uploadDir, 'thumb-crop', image);

  var pullParam = {};
  pullParam[options.imagesHash] = image;
  
  var updateData = {
    modified: new Date(),
    $pull: pullParam
  }; 

  co(function* () {

    yield q.ninvoke(options.Model, 'update', { _id: id }, updateData);

    execSync(format('rm -f %s', filePath));
    execSync(format('rm -f %s', thumbPath));

    res.status(204).end();

  }).catch(function(error) {
    res.status(500).send(error);
  });
  
}

module.exports = {
  UploadImage: UploadImage,
  DeleteImage: DeleteImage
}