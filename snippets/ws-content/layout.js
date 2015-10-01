var path = require('path');
var App = require('app');
var fs = require('fs');

var Handlebars = require('handlebars');
var debug = App.debugFactory('snippet:postcards-onePostcard:layout');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  
var heritage = fs.readFileSync(path.join(__dirname, 'heritage.html'), 'utf8');
var certainty = fs.readFileSync(path.join(__dirname, 'certainty.html'), 'utf8');
var taste = fs.readFileSync(path.join(__dirname, 'taste.html'), 'utf8');
var choose = fs.readFileSync(path.join(__dirname, 'choose.html'), 'utf8');
var seize = fs.readFileSync(path.join(__dirname, 'seize.html'), 'utf8');
var tips = fs.readFileSync(path.join(__dirname, 'tips.html'), 'utf8');

var LayoutView = App.LayoutView.extend({   
  
  id: 'ws-content',
  tagName: 'div',
  className: 'ws-content',
  
  template: Handlebars.compile(layoutTemplate),
  
  initialize: function(options) {  
    //this.options = options;
  },
  
  events: {
    'click .back': function(event) {
      
      event.preventDefault();

      App.router.navigate('', { trigger: true });

      //scroll.animateScroll(null, 'a');
    }
  },
  
  render: function() {
    switch (this.options.id) {
      case 'heritage':
        this.options.banner = 'images/about_TCS_sub-07History.png';
        this.options.content = heritage;
      break
      case 'certainty':
        this.options.banner = 'images/about_TCS_sub-08experience.png';
        this.options.content = certainty;
      break
      case 'taste':
        this.options.banner = 'images/about_TCS_sub-09taste.png';
        this.options.content = taste;
      break
      case 'choose':
        this.options.banner = 'images/about_TCS_sub-11choose.png';
        this.options.content = choose;
      break
      case 'seize':
        this.options.banner = 'images/about_TCS_sub-10seize.png';
        this.options.content = seize;
      break
      case 'tips':
        this.options.banner = '';
        this.options.content = tips;
      break
    }
    this.$el.html(this.template(this.options));
  },
  
  onRender: function() {
    debug('render');
    //this.renderNested();
  }
  
});

module.exports = LayoutView;
