var path = require('path');
var App = require('../app');
var debug = App.debugFactory('app:layout');
var $ = require('jquery');
var q = require('q');

module.exports = {
  isAdmin: function() {
    var d = q.defer();
    
    $.getJSON('/api/login')
      .done(d.resolve)
      .fail(d.reject);
    
    return d.promise;
  }
};