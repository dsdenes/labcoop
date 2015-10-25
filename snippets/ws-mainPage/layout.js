var path = require('path');
var App = require('app');
var fs = require('fs');
var co = require('co');
var _ = require('underscore');

var Handlebars = require('handlebars');
var debug = App.debugFactory('snippet:mainPage:layout');

var format = require('util').format;

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

var lazyYoutube = require('lazy-youtube');
var fancybox = require('fancybox');
var scroll = require('smooth-scroll');
var ItemModel = require('../../model/cases').Model;

// default content
App.eventReqres.setHandler("render:content" , function() {
  return LayoutView;
});

var LayoutView = App.LayoutView.extend({   
  
  id: 'ws-mainpage',
  className: 'container',
  
  template: Handlebars.compile(layoutTemplate),

  regions: {  

    'filterbox': {
      selector: '.region-filterbox',
      allowMissingEl: true
    },
    
    'joblist': {
      selector: '.region-joblist',
      allowMissingEl: true
    }

  },   
  
  render: function() {
    this.$el.html(this.template(this.options));
  },  
  
  events: {
    'submit #form-start': 'submitForm'
  },
  
  removeError: function() {
    this.$el.find('.message').remove();
  },

  message: function(type, message) {
    this.removeError();
    this.$el.find('#form-start button').after(format('<p class="message bg-%s">%s</p>', type, message));
  },

  validateForm: function() {

    var $form = this.$el.find('#form-start');

    var data = _.object($form.serializeArray().map(function(v) {
      return [v.name, v.value];
    }));

    if (!data.phone) {
      this.message('danger', 'Kérjük adja meg a telefonszámát, hogy vissza tudjuk hívni!');
      return false;
    }

    return _.pick(data, _.identity);
  },  
  
  submitForm: function(event) {

    event.preventDefault();

    var _this = this;

    this.removeError();

    this.$el.find('#form-start button').addClass('ajax');

    var caseData;
    if (caseData = this.validateForm()) {
      
      var model = new ItemModel();

      model.set(caseData);
      
      model.save(null, {
        success: function() {
          _this.message('success', 'Köszönjük! Diszpécserünk hamarosan keresni fogja!');
        },
        error: function(caseRes, error) {
          _this.message('danger', 'A megadott telefonszám hibásnak néz ki!');
        }
      });

    }

  },
  
  onShow: function() {
    this.renderNested();
  }
});

module.exports = LayoutView;
