// for build time compiler
import path from 'path';

var fs = require('fs');
const layoutTemplate = fs.readFileSync(__dirname + '/index.html', 'utf8');
const foodsTemplate = fs.readFileSync(__dirname + '/model.html', 'utf8');
const foodsCollectionTemplate = fs.readFileSync(__dirname + '/collection.html', 'utf8');
// for build time compiler

import co from 'co';
import $ from 'jquery';
import _ from 'underscore';
import Handlebars from 'handlebars';
import {format} from 'util';
import moment from 'moment';

const debug = App.debugFactory('snippet:mainPage:layout');

import App from 'app';
import { Model as FoodsModel } from '../../model/foods';
import { Collection as FoodsCollection } from '../../model/foods';
import { Model as UsersModel } from '../../model/users';
import { getLoggedinUserId } from '../../lib/auth';

const LayoutView = App.LayoutView.extend({   
  
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
    'submit #form-food': 'submitForm',
    'click a.delete': 'deleteFood',
    'click a.edit': 'editFood',
    'click a.save': 'saveFood',
    'click #form-filter button': 'filterList',
    'keyup input[name="daily"]': 'checkDaily'
  },
  
  removeError: function() {
    this.$el.find('.message').remove();
  },

  message: function(type, message) {
    this.removeError();
    this.$el.find('#form-food button').after(format('<p class="message bg-%s">%s</p>', type, message));
  },

  validateForm: function() {

    var $form = this.$el.find('#form-food');

    var data = _.object($form.serializeArray().map(function(v) {
      return [v.name, v.value];
    }));

    if (!data.food) {
      this.message('danger', 'Plese set the food name!');
      return false;
    }

    if (!data.calories) {
      this.message('danger', 'Plese set the calories!');
      return false;
    }

    return _.pick(data, _.identity);
  },  
  
  submitForm: function(event) {

    event.preventDefault();
    
    this.showOriginalList();

    var _this = this;

    this.removeError();

    var foodData;
    if (foodData = this.validateForm()) {
      
      foodData.created = new Date().toISOString();
      
      let foodModel = new FoodsModel(foodData);
            
      foodModel.save(null, {
        success: function() {
          _this.foodCollection.add(foodModel);
        },
        error: function(caseRes, error) {
          _this.message('danger', 'Cannot add the new entry, something bad happened!');
        }
      });

    }

  },
  
  deleteFood: function(event) {
    event.preventDefault();
    
    let _this = this;
    
    return co(function* () {
      let dataId = $(event.target).data('id');

      let foodModel = _this.foodCollection.get(dataId);

      return yield foodModel.destroy();
    });
    
  },
  
  saveFood: function(event) {
    event.preventDefault();
    
    let _this = this;
    
    return co(function* () {
      let $tr = $(event.target).parents('tr');

      let dataId = $(event.target).data('id');
      let foodModel = _this.foodCollection.get(dataId);

      let foodData = {
        food: $tr.find('input[name="food"]').val(),
        calories: $tr.find('input[name="calories"]').val()
      };

      foodModel.set(foodData);

      yield foodModel.save();      
      
      _this.foodCollectionView.render();
    
    }).catch(function(error) {
      
    });
    
  },
  
  editFood: function(event) {
    event.preventDefault();

    return co(function* () {
      let $tr = $(event.target).parents('tr');
      
      $tr.find('span').hide();
      $tr.find('td.edit').hide();
      $tr.find('input').show();
      $tr.find('td.save').show();

      return;   
    });

  },
  
  filterList: function(event) {
    
    event.preventDefault();
    
    let $form = $(event.target).parents('form');
    let start = $form.find('input[name="start"]').val();
    let end = $form.find('input[name="end"]').val();

    let filteredFoods = this.foodCollection.filter(function (food) {
      
      let foodDate = moment(food.get('created')).unix();
      
      try {
        
        if (start && foodDate < moment(start).unix()) {
          throw '';
        }
        
        if (end && foodDate > moment(end).unix() + 86400) {
          throw '';
        }
        
        return true;
        
      } catch(e) {
        console.log(e);
        return false;
      }
      
    });
    
    let filteredFoodCollection = new FoodsCollection(filteredFoods);
    this.foodCollectionView.collection = filteredFoodCollection;
    this.foodCollectionView.render();

  },
  
  showOriginalList: function() {
    this.foodCollectionView.collection = this.foodCollection;
    this.foodCollectionView.render();
  },
  
  checkDaily: function(event) {
    event.preventDefault();
    
    let $input = $(event.target);
    
    let limit = $input.val();
    
    if (!limit) {
      $input
        .removeClass('ok')
        .removeClass('notok');
      return;
    }
    
    var mmt = moment();
    
    let todayFrom = mmt.clone().startOf('day').unix();
    let todayTo = mmt.clone().endOf('day').unix();

    let sum = 0;
    
    this.foodCollection.each(function (food) {

      let foodDate = moment(food.get('created')).unix();
 
      // today
      if (foodDate >= todayFrom && foodDate <= todayTo) {
        sum+= food.get('calories');
      }

    });

    
    if (sum > limit) {
      $input
        .removeClass('ok')
        .addClass('notok');
    } else {
      $input
        .removeClass('notok')
        .addClass('ok');
    }
    
  },
  
  onShow: function() {
    
    debug('showed');
    
    this.renderNested();
    
    var _this = this;
    
    this.$el.find('#form-filter .input-daterange').datepicker();

    co(function*() {
      
      var userId = yield getLoggedinUserId();

      _this.foodCollection = new (FoodsCollection.extend({
        url: format('/api/users/%s/foods', userId)
      }))();

      _this.foodCollectionView = new FoodCollectionView({
        collection: _this.foodCollection
      });
      
      _this.foodCollectionView.render();

      // API request
      _this.foodCollection.fetch();

    }).catch(function(error) {
      App.router.navigate('login', { trigger: true });
    });
    
  }
});

const FoodView = App.Backbone.Marionette.ItemView.extend({

  tagName: 'tr',

  initialize: function() {

  },

  serializeData: function() {   

    var attribs = _.extend(this.model.attributes, {
    });

    return attribs;
  },

  template: Handlebars.compile(foodsTemplate)

});

const FoodCollectionView = App.Backbone.Marionette.CollectionView.extend({

  el: '.region-foods',

  childView: FoodView,
  childViewOptions: function(model, index) {
    return {};
  }

});

export { LayoutView, FoodView, FoodCollectionView };
