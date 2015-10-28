"use strict";
/* jshint browser: true, jquery: true, devel: true, unused: true, undef: true, freeze: true, curly: true, eqeqeq: true, funcscope: true, latedef: true, noarg: true, notypeof: true, shadow: true, globalstrict: true, maxparams: 4, maxdepth: 4, maxstatements: 15, maxcomplexity: 6 */
/* global Handlebars: true */

/**
 * Loading common resources
 */
var window = window || {}

import jQuery from 'jquery';
const $ = window.jQuery = window.$ = jQuery;

import _ from 'underscore';
import Backbone from 'backbone';
Backbone.$ = $;

import Marionette from 'backbone.marionette';
import Wreqr from 'backbone.wreqr';

Backbone.Marionette = Marionette;
Backbone.Marionette.$ = Backbone.$;
Backbone.Wreqr = Wreqr;

// FIXME motherfucker Marionette error
Backbone.Marionette.Application.prototype._initChannel = function() {};

import Handlebars from 'handlebars';

/**
 * Initializing Backbone application
 **/
const App = new Backbone.Marionette.Application();

App.Backbone = Backbone;
App.Wreqr = Backbone.Wreqr;
App.eventReqres = new App.Wreqr.RequestResponse();
App.commands = new App.Wreqr.Commands();
App.vent = new App.Wreqr.EventAggregator();

// Setup front-end debug
import debugFactory from 'debug';
App.debugFactory = debugFactory;
App.debugFactory.enable('*');
const debug = App.debugFactory('app');

/**
 * Exporting common resources
 */
export default App;
export { Backbone };
export { Marionette };
export { Handlebars };
export { debug };

/**
 * Loading additional application resources
 * Remains require, because babelify changes order anyway
 */

// Application specific resources
require('./appResources');

// Main Layout
App.layout = require('./mainLayout');

// Main router
App.router = require('./mainRouter');

// Initializing snippets
const snippets = require('./lib/snippets');
snippets.init();
  
/**
 * Events on application start
 */

// App started
App.on('start', () => {

  //App.layout.render();
  
  Backbone.history.start();  
  
});

// DOM loaded, start App
$(() => {

  App.start();  
  
});
