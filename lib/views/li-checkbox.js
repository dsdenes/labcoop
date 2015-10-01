var $ = require('jquery');
var _ = require('underscore');
var Handlebars = require('handlebars');
var _s = require('underscore.string');

var App = require('app');

//var liTemplate = fs.readFileSync(path.join(__dirname, 'li-checkbox.html'), 'utf8');

module.exports = App.Backbone.Marionette.ItemView.extend({
  
  template: Handlebars.compile('<input data-name="{{name}}" type="checkbox" /><label>{{name}}</label>'),

  tagName: 'li',
  
  className: 'catrow',
  
  initialize: function(options) { 
    
    this.options = options;
        
  },
  
  modelEvents: {
    'change': 'modelChanged'
  },
  
  modelChanged: function() {
    console.log('modelChanged');
  },
  
  onRender: function() {
    
    this.options.checked && this.setChecked(this.options.checked);  
  
  },
  
  setChecked: function(tags) {

    if (_.contains(tags, this.model.get('name'))) {
      this.$el.find('input').prop('checked', true);
    }
  }

});