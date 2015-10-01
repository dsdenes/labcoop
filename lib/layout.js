var path = require('path');
var App = require('../app');
var debug = App.debugFactory('app:layout');
var $ = require('jquery');
var q = require('q');

App.renderNested = function(view, region, options) {
  debug('renderNested: ' + region);
  
  let ChildView = App.eventReqres.request("render:" + region);
  if (!ChildView) return;
  
  try {
    
    var childView = (typeof ChildView === 'function') ? new ChildView(options) : ChildView;
    
    return view.showChildView(region, childView);
    
  } catch (e) {
    debug(e);
    throw 'Failed to render nested view into ' + region;
  }
}

App.LayoutView = App.Backbone.Marionette.LayoutView.extend({
  
  renderNested: function(options) {
    
    let todo = [];
    
    if (this.regions) {
      
      for (let region in this.regions) {
        todo.push(App.renderNested(this, region, options));
      }
      
    }
    
    return q.all(todo);
  }

});

module.exports = {

}