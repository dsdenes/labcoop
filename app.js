"use strict";
/* jshint browser: true, jquery: true, devel: true, unused: true, undef: true, freeze: true, curly: true, eqeqeq: true, funcscope: true, latedef: true, noarg: true, notypeof: true, shadow: true, globalstrict: true, maxparams: 4, maxdepth: 4, maxstatements: 15, maxcomplexity: 6 */
/* global require: true, Handlebars: true */

require("babel/polyfill");

/***********************
 * Loading resources
 ***********************/
if (typeof window === 'undefined') {
  window = {};
}

var $ = window.jQuery = window.$ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
Backbone.Marionette = require('backbone.marionette');

// motherfucker Marionette error
Backbone.Marionette.Application.prototype._initChannel = function() {};

Backbone.Marionette.$ = Backbone.$;
Backbone.Wreqr = require('backbone.wreqr');
var Handlebars = require('handlebars');

// Bootstrap
require('../node_modules/bootstrap/dist/js/bootstrap.min.js');

// Bootstrap notify
//require('../node_modules/bootstrap-notify/bootstrap-notify.min.js');

// Datatables
//require('../node_modules/datatables/media/js/jquery.dataTables.min.js');
//require('../node_modules/datatables-bootstrap3-plugin/media/js/datatables-bootstrap3.min.js');

// FileUpload
require('../node_modules/blueimp-file-upload/js/jquery.iframe-transport.js');
require('../node_modules/blueimp-file-upload/js/jquery.fileupload.js');
require('../node_modules/blueimp-file-upload/js/jquery.fileupload-process.js');
require('../node_modules/blueimp-file-upload/js/jquery.fileupload-image.js');
require('../node_modules/blueimp-file-upload/js/jquery.fileupload-validate.js');

// Slick carousel
require('slick-carousel');

var repeat = require('handlebars-helper-repeat');
Handlebars.registerHelper('repeat', repeat);  

// Marionette browser inspector helper
if (window.__agent) {
  window.__agent.start(Backbone, Backbone.Marionette);
}

/***********************
 * Initializing Backbone application
 ***********************/
var App = new Backbone.Marionette.Application();
module.exports = App;
App.Backbone = Backbone;
App.Wreqr = Backbone.Wreqr;
App.eventReqres = new App.Wreqr.RequestResponse();
App.commands = new App.Wreqr.Commands();
App.vent = new App.Wreqr.EventAggregator();
App.Backbone.LocalStorage = require("backbone.localstorage");


App.debugFactory = require('debug');
App.debugFactory.enable('*');
var debug = App.debugFactory('app');

/***********************
 * Register layot helers
 ***********************/
require('./lib/layout');

App.layout = require('./appLayout');
App.router = require('./appRouter');

  /***********************
   * Initializing snippets
   ***********************/
  var snippets = require('./lib/snippets.js').init();
  
// DOM loaded, App started
App.on('start', function (options) {
  
  debug('start');

  App.layout.render();
  
  debug('ROUTER found: ' + Backbone.history.start());  
  
});

/***********************
 * Other stuff
 ***********************/
var webfontloader = require('webfontloader.cdn');

webfontloader.load({
  google: {
    families: ['Oswald:300', 'Oswald:400', 'Oswald:700', 'Coustard:400']
  }
});

function isMobile() {
  var ua = (navigator.userAgent || navigator.vendor || window.opera, window, window.document);
  return (/iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
}

App.static = {};
App.static.mobile = isMobile();

/***********************
 * jQuery loaded
 ***********************/
$(function() {
  
  debug('jQuery DOMReady');

  App.start();  
  
  // compiling templates
  //var template = Handlebars.compile($('#mainTemplate').html());
  //$('#container').html(template());

  // triggering DOM ready on snippets
  snippets.afterDOM();
  
});

