import App from 'app';
import $ from 'jquery';
import q from 'q';
import co from 'co';

function renderNested(view, region, options) {
  
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
        todo.push(renderNested(this, region, options));
      }
      
    }
    
    return q.all(todo);
  }

});

