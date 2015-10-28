import App from 'app';
import Handlebars from 'handlebars';

// because brfs
var fs = require('fs');
const layoutTemplate = fs.readFileSync(__dirname + '/mainLayoutTemplate.html', 'utf8');

export default new (App.LayoutView.extend({

  el: '#application',

  template: Handlebars.compile(layoutTemplate),
  
  onRender: function() {
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
