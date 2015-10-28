import App from 'app';

const router = new (App.Backbone.Router.extend({   

  routes: {
    'login': 'login',
    'login/logout': 'logout'
  }

}));

export default router;