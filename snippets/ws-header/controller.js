import App from 'app';
import router from './router'
import {LayoutView} from './layout'

router.on(null, function(action) {
  
});

// default content
App.eventReqres.setHandler("render:header" , function() {
  return LayoutView;
});
