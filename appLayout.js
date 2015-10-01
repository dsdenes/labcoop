var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');
var App = require('./app');
var debug = App.debugFactory('app:appLayout');
var q = require('q');
var $ = require('jquery');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'appLayout.hbs'), 'utf8');

var appLayout = new (App.LayoutView.extend({

  el: '#application',

  template: Handlebars.compile(layoutTemplate),
  
  onRender: function() {
    debug('render');
    this.renderNested();
  },

  regions: {
    header: {
      selector: '.region-header',
      allowMissingEl: true
    },
    content: {
      selector: '.region-content',
      allowMissingEl: true
    },
    footer: {
      selector: '.region-footer',
      allowMissingEl: true
    }
  }

}));
   
module.exports = appLayout;