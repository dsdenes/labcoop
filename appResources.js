/* jshint browser: true, jquery: true, devel: true, unused: true, undef: true, freeze: true, curly: true, eqeqeq: true, funcscope: true, latedef: true, noarg: true, notypeof: true, shadow: true, globalstrict: true, maxparams: 4, maxdepth: 4, maxstatements: 15, maxcomplexity: 6 */
/* global require: true, Handlebars: true */

import App from 'app';
import Handlebars from 'handlebars';

// Bootstrap
//import '../node_modules/bootstrap/dist/js/bootstrap.min.js';

// Localstorage modul
import BackboneLocalStorage from 'backbone.localstorage';
App.Backbone.LocalStorage = BackboneLocalStorage;

// Handlebars helper
import handlebarsRepeat from 'handlebars-helper-repeat';
Handlebars.registerHelper('repeat', handlebarsRepeat);  

import 'bootstrap-datepicker';

// Auth helpers
import './lib/auth';

// Layout helpers
import './lib/layout';
