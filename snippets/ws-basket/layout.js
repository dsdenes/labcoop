var path = require('path');
var App = require('app');
var fs = require('fs');

var Handlebars = require('handlebars');
var debug = App.debugFactory('snippet:basket:layout');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

var LayoutView = App.LayoutView.extend({   
  
  template: Handlebars.compile(layoutTemplate),
  
  onRender: function() {
    debug('render');
    this.renderNested();
  }
  
});

module.exports = LayoutView;
