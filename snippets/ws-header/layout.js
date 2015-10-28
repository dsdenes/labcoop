// for build time compiler
import path from 'path';

var fs = require('fs');
const layoutTemplate = fs.readFileSync(__dirname + '/index.html', 'utf8');

// for build time compiler

import co from 'co';
import _ from 'underscore';
import $ from 'jquery';
import Handlebars from 'handlebars';
import {format} from 'util';

import App from 'app';
import { Model as FoodModel } from '../../model/foods';
import { isLoggedin } from '../../lib/auth';

const debug = App.debugFactory('snippet:header:layout');

const LayoutView = App.LayoutView.extend({   
  
  template: Handlebars.compile(layoutTemplate),
  
  id: 'ws-header',
  className: 'container-fluid',
  
  onShow: function() {

    var _this = this;
    
    co(function*() {
      _this.showLoggedin(yield isLoggedin());
    });

    App.vent.on('loggedin', function(loggedin) {
      _this.showLoggedin(loggedin);
    });    
    
  },                  

  showLoggedin: function(loggedin) {
    if (loggedin) {
      this.$el.find('.loggedout').hide();
      this.$el.find('.loggedin').show();
    } else {
      this.$el.find('.loggedin').hide();
      this.$el.find('.loggedout').show();
    }
  }                   
  
});

export { LayoutView };