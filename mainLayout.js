import App, { Handlebars } from './App';
import path from 'path';

// because brfs
var fs = require('fs');
const layoutTemplate = fs.readFileSync(path.join(__dirname, 'mainLayoutTemplate.html'), 'utf8');

export default new (App.LayoutView.extend({

  el: '#application',

  template: Handlebars.compile(layoutTemplate),
  
  onRender: () => {
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