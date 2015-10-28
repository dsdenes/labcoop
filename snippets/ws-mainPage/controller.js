import App from 'app';
import router from './router'
import {LayoutView} from './layout'

router.on('route:mainPage', function(action) {
  
});

// default content
App.eventReqres.setHandler("render:content" , function() {
  return LayoutView;
});
