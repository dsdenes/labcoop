import co from 'co';
import App from 'app';
import router from './router';
import { LayoutView } from './layout';
import { logout } from '../../lib/auth';

App.eventReqres.setHandler("render:login" , function() {
  return LayoutView;
});

router.on('route:login', function() {
  
  App.layout.showChildView('content', new LayoutView());
  
});

router.on('route:logout', function() {

  co(function* () {
    yield logout();
    App.router.navigate('login', { trigger: true });
  });

});